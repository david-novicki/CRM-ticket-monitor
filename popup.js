/* 
Ticket monitor Chrome Extension:
This extension is used to call your api which returns a ticket id(CRM tickets). This app saves the ticket id
and if this id changes it will send you desktop notifications. 
*/
var backGround = chrome.extension.getBackgroundPage();
var isOn = (localStorage.NotificationStatus == "1");
var btnToggle = document.getElementById('btnSwitch');
var lblLastChkd = document.getElementById('lblLastChk');

//toggle on and off checking the api for a new ticket
function toggleOnOff() {
    isOn = (localStorage.NotificationStatus == "1");
    localStorage.NotificationStatus = (isOn ? "0" : "1");
    if(localStorage.NotificationStatus == "1"){
        backGround.startRequest();
        btnToggle.innerHTML = "Turn off";
        btnToggle.className = "on";        
    } else {
        backGround.stopRequest();
        btnToggle.innerHTML = "Turn on";
        btnToggle.className = "off";
        lblLastChkd.innerHTML = '';
    }
}


// Run our function script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    btnToggle = document.getElementById('btnSwitch');
    lblLastChkd = document.getElementById('lblLastChk');
    var hasNotf = backGround.hasNotifications();
    console.log("hasNotifications:", hasNotf);
    if (hasNotf) {
        console.log("hit");
        //save last ticket id as last seen
        backGround.updateTickets();
        //reset notifications
        backGround.resetNotifications();
        //refresh or open ticket tab
        backGround.updateTabs();
    }

    //establish button status
    isOn = (localStorage.NotificationStatus == "1");
    btnToggle.innerHTML = (!isOn ? "Turn on" : "Turn off");
    if (isOn)
        btnToggle.className = "on";
    else
        btnToggle.className = "off";

    if (localStorage.LastChecked != undefined)
        lblLastChkd.innerHTML = localStorage.LastChecked;

    //added toggle functionality to on/off button
    document.getElementById('btnSwitch').addEventListener('click', function () {
        backGround.resetNotifications();
        toggleOnOff();
    });
});


