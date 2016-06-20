/*
Background.js:
this code file is the js page that runs in the background when the app is start. Time is in military time.
 */
var pollInterval = 1000 * 120; // 1 minute
var lstmsgs = 0;
var timerId;
var lastRead;
var lastUnread;
var hasNtfctns = false;
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function ToggleNotify(isOn) {
    if (isOn)
        setTimeout(startRequest, 10000);
}

function hasNotifications() {
    console.log("hasNtfctns",hasNtfctns);
    if (hasNtfctns == undefined) {
        return false;
    } else
        return hasNtfctns;
}

function getDateAndTime() {
    var date = new Date();
    var day = days[date.getDay()]
    var hour = date.getHours();
    var minutes = (date.getMinutes().length < 2 ? '0' + date.getMinutes() : date.getMinutes());
    var ampm = (date.getMinutes < 12 ? "pm" : "am")
    return day + " - " + hour + ":" + minutes + ampm;
}
//makes api call to 
function getUnreadItems(callback) {

    console.log("CheckingTickets: ", getDateAndTime());
    $.ajax({      
        type: "GET",
        url: "insert api url here",
        timeout: 100000,
        xhrFields: {
            'withCredentials': true
        },
        success: function (ui) {
            console.log(ui.latest);
            localStorage.LastChecked = getDateAndTime();
            if (ui.latest != lastRead) {
                if (lastRead != undefined) {
                    lastRead = ui.latest;
                    hasNtfctns = true;
                    callback("!");                    
                } else
                    lastRead = ui.latest;
            }            
        },
        error: function (jqXHR, status, error) {
            console.log(jqXHR);
            callback("*");
        }
    });
}
//updates last unread ticket to be read.
function updateTickets() {
    lastRead = lastUnread;
}
//updates badge based on results.
function updateBadge() {
    getUnreadItems(function(data) {
        chrome.browserAction.setBadgeText({ text: data });
        if (data == "*") {
            chrome.browserAction.setBadgeBackgroundColor({color: red})
        } else {
            chrome.browserAction.setBadgeBackgroundColor({ color: "#f69c55" })
        }
        notify();
    });
}
//starts requests
function startRequest() {
    updateBadge();
    timerId = window.setTimeout(startRequest, pollInterval);
    console.log("Running");
}
//stops requests
function stopRequest() {
    clearTimeout(timerId);
    console.log("Not Running");
}
//resets notification badge
function resetNotifications() {
    hasNtfctns = false;
    chrome.browserAction.setBadgeText({ text: '' });
}
//checks for permission to send notification message and sends on if applicable.
function notify() {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }
    new Notification(lastRead, {
        icon: 'img/main48.png',
        body: 'New Ticket!'
    });  
}
//checks for open CRM ticket page and refreshes or opens a new tab.
function updateTabs() {
    var ticketURL = "CRM ticket page";
    chrome.tabs.query({ "url": ticketURL }, function (arr) {
        console.log(arr);
        if (arr.length > 0) {
            console.log("tabid: ",arr[0].id);
            chrome.tabs.reload(arr[0].id);
        } else {
            chrome.tabs.query({ "url": ticketURL + "?modeid=list" }, function (arr) {
                console.log(arr);
                if (arr.length > 0) {
                    console.log("tabid: ", arr[0].id);
                    chrome.tabs.reload(arr[0].id);
                } else {
                    chrome.tabs.create({ "url": ticketURL });
                }
            });
        }
    });
}
//document.ready function to check status of app and make sure it is running, this is incase of computer restarts
//or chrome crashes.
$(document).ready(function () {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    if (localStorage.NotificationStatus =="1") {
        startRequest();
    }
});