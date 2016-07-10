var seen = [];

// Set listeners
chrome.notifications.onButtonClicked.addListener(onButtonClicked);
chrome.notifications.onClicked.addListener(onNotificationClicked);

// Cache all current rants
console.debug("Checking beginning state...");
checkRants(true);

// Start checking for new rants
console.debug("Waiting for new rants...");
chrome.storage.sync.get({pollingRate: 5}, function(items) {
    setInterval(checkRants, items.pollingRate * 60000);
});


// Open devRant on click
chrome.browserAction.onClicked.addListener(function () {
    chrome.storage.sync.get({sortMethod: 'recent'}, function (items) {
        chrome.tabs.create({url: "https://www.devrant.io/feed/" + items.sortMethod});
    });
});

/**
 * This function is called whenever a notification is clicked.
 * If that happens then the notification will be closed.
 *
 * @param notificationId the notification id
 */
function onNotificationClicked(notificationId) {
    chrome.notifications.clear(notificationId);
}

/**
 * This function is called whenever a button on a notification is clicked.
 * If that happens then an action will be triggered based on which button was clicked.
 * After that the notification will be closed.
 *
 * @param notificationId the notification id
 * @param buttonIndex the index of the clicked button (0 or 1)
 */
function onButtonClicked(notificationId, buttonIndex) {
    if (buttonIndex == 0) {
        openUrl(notificationId);
    } else if (buttonIndex == 1) {
        setClipboard(notificationId);
    }
    chrome.notifications.clear(notificationId);
}

/**
 * Call this function to open an url based on the preference set by the user.
 *
 * @param url the url to open
 */
function openUrl(url) {
    chrome.storage.sync.get({openMethod: 'panel'}, function (items) {
        if (items.openMethod == 'panel') {
            openUrlInPanel(url);
        } else {
            openUrlInTab(url);
        }
    });
}

/**
 * Open the url in a new tab.
 *
 * @param url the url
 */
function openUrlInTab(url) {
    chrome.tabs.create({url: url})
}

/**
 * Open the url in a new panel.
 *
 * @param url the url
 */
function openUrlInPanel(url) {
    chrome.windows.create({
        "url": url,
        "type": "detached_panel",
        "focused": true
    });
}

/**
 * Copy a value to your clipboard.
 *
 * @param contents the value
 */
function setClipboard(contents) {
    var input = document.createElement('textarea');
    document.body.appendChild(input);
    input.value = contents;
    input.focus();
    input.select();
    document.execCommand('Copy');
    input.remove();
}

/**
 * Check for new rants.
 *
 * @param silent set to true to prevent notifications from being triggered
 */
function checkRants(silent) {
    chrome.storage.sync.get({sortMethod: 'recent'}, function (items) {
        console.debug("Checking for Rants (" + items.sortMethod + ")...");
        get(
            "devrant/rants",
            {
                "sort": items.sortMethod
            }
        ).success(function (data) {
            data.rants.forEach(function (rant) {
                showRant(rant, silent);
            });
        });
    });

}

function showRant(rant, silent) {
    if (!silent && seen.indexOf(rant.id) == -1) {
        console.debug("Found New Rant!");
        if (rant.attached_image != '') {
            showImageRant(rant);
        } else {
            showTextRant(rant);
        }
    }
    seen.push(rant.id);
}

/**
 * Display a text rant notification.
 *
 * @param rant the rant
 */
function showTextRant(rant) {
    createNotification(rant, {
        type: "basic"
    });
}

/**
 * Display an image rant notification.
 *
 * @param rant the rant
 */
function showImageRant(rant) {
    createNotification(rant, {
        type: "image",
        imageUrl: rant.attached_image.url
    });
}

/**
 * Display a rant notification with some default settings.
 *
 * @param rant the rant
 * @param options the options
 */
function createNotification(rant, options) {
    options.title = rant.user_username;
    options.iconUrl = "icons/logo_500.png";
    options.message = rant.text;
    options.isClickable = true;
    options.buttons = [
        {
            "title": "Open Rant",
            "iconUrl": "icons/open_icon.png"
        },
        {
            "title": "Copy Link",
            "iconUrl": "icons/copy_icon.png"
        }
    ];

    chrome.storage.sync.get({requireInteraction: true}, function (items) {
        options.requireInteraction = items.requireInteraction;

        chrome.notifications.create(
            "https://www.devrant.io/rants/" + rant.id,
            options
        );
    });

}

/**
 * Perform a json get request.
 *
 * Usage:
 * get("devrant/rants).success(function(data) {...});
 *
 * @param path the path of the request
 * @param parameters the parameters for the request
 *
 * @returns a hook for the response
 */
function get(path, parameters) {
    parameters.app = 3;

    var callback = {
        onSucces: function () {
        },
        success: function (onSuccess) {
            callback.onSuccess = onSuccess;
        }
    };

    var url = 'https://www.devrant.io/api/' + path + "?" +
        Object.keys(parameters)
            .map(function (key) {
                return key + "=" + parameters[key]
            })
            .join("&");

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var data = JSON.parse(xhr.responseText);
            if (data.success) {
                callback.onSuccess(data, xhr)
            }
        }
    };
    xhr.open("GET", url, true);
    xhr.send();

    return callback;
}
