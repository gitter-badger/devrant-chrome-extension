/**
 * Here we define the options that are available for this extension.
 * @type {*[]}
 */
var optionDefinitions = [
    {
        id: 'sortMethod',
        default: 'recent',
        getValue: function (element) {
            return element.value;
        },
        setValue: function (element, value) {
            element.value = value;
        }
    },
    {
        id: 'openMethod',
        default: 'panel',
        getValue: function (element) {
            return element.value;
        },
        setValue: function (element, value) {
            element.value = value;
        }
    },
    {
        id: 'requireInteraction',
        default: true,
        getValue: function (element) {
            return element.checked;
        },
        setValue: function (element, value) {
            element.checked = value;
        }
    },
    {
        id: 'pollingRate',
        default: 5,
        getValue: function (element) {
            return element.value;
        },
        setValue: function (element, value) {
            element.value = value;
        }
    }
];

/**
 * Save the options to chrome.storage.sync.
 */
function saveOptions() {
    console.debug("Saving Options...");
    var options = {};

    optionDefinitions.forEach(function (option) {
        options[option.id] = option.getValue(document.getElementById(option.id));
    });

    chrome.storage.sync.set(options, reportOptionsSaved);
}

/**
 * Show the 'Options saved' message for a moment.
 */
function reportOptionsSaved() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function () {
        status.textContent = '';
    }, 750);
}

/**
 * Insert the options in the elements in the dom.
 */
function restoreOptions() {
    console.debug("Restoring Options...");
    var optionDefaults = {};
    optionDefinitions.forEach(function (option) {
        optionDefaults[option.id] = option.default;
    });

    chrome.storage.sync.get(optionDefaults,
        function (items) {
            optionDefinitions.forEach(function (option) {
                option.setValue(document.getElementById(option.id), items[option.id]);
            });
        });
}

/**
 * Add change listeners to all options elements.
 */
function registerListeners() {
    optionDefinitions.forEach(function (option) {
        document.getElementById(option.id).addEventListener('change', saveOptions);
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener('DOMContentLoaded', registerListeners);

