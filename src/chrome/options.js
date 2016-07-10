/**
 * Here we define the options that are available for this extension.
 * @type {*[]}
 */
var optionDefinitions = [
    new Option('sortMethod', 'recent', 'value'),
    new Option('openMethod', 'panel', 'value'),
    new Option('requireInteraction', true, 'checked'),
    new Option('pollingRate', 5, 'value', function (value) {
        if (isNaN(value)) {
            throw "The polling rate must be a number";
        }
    })
];

function Option(id, defaultValue, elementExtractor, validationFunction) {
    return {
        id: id,
        default: defaultValue,
        getValue: function (element) {
            return element[elementExtractor];
        },
        setValue: function (element, value) {
            element[elementExtractor] = value;
        },
        validate: typeof validationFunction !== 'undefined' ?
            validationFunction :
            function () {
            }
    }
}

/**
 * Save the options to chrome.storage.sync.
 */
function saveOptions() {
    console.debug("Saving Options...");
    var options = {};
    var errored = false;
    optionDefinitions.forEach(function (option) {
        try {
            var value = option.getValue(document.getElementById(option.id));
            option.validate(value);
            options[option.id] = value;
        } catch (error) {
            errored = true;
            setStatus(error, false);
        }
    });

    if (!errored) {
        chrome.storage.sync.set(options, function () {
            setStatus("Options Saved", true);
        });
    }
}

/**
 * Show the 'Options saved' message for a moment.
 */
function setStatus(message, success) {
    var status = document.getElementById('status');
    status.className = success ? 'success' : 'error';
    status.textContent = message;
    setTimeout(function () {
        status.textContent = '';
    }, 1000);
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

