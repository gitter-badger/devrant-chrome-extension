// Saves options to chrome.storage.sync.

function save_options() {
    console.debug("Saving Options...");
    chrome.storage.sync.set({
        sortMethod:  document.getElementById('sortMethod').value,
        openMethod:  document.getElementById('openMethod').value
    }, report_options_saved);
}

function report_options_saved() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function () {
        status.textContent = '';
    }, 750);
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get({
        sortMethod: 'recent',
        openMethod: 'panel'
    }, function(items) {
        document.getElementById('sortMethod').value = items.sortMethod;
        document.getElementById('openMethod').value = items.openMethod;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);

var selects = document.getElementsByTagName("select");
for (var i = 0; i < selects.length; i++) {
    selects[i].addEventListener('change', save_options);
}
