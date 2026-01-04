// JavaScript Document
// from the launchpad page onclick calls one of these functions for an 800x600 window (setWindow) OR fullscreen (setWindow_fs)


// change windowWidth and windowHeight to a number or screen.availWidth and screen.availHeight if you want a "fullscreen" version
var windowWidth=screen.availWidth;
var windowHeight=screen.availHeight;
	
function setWindow() {
interfacewindow = window.open("data/main.html", "interfacewindow", "toolbar=no, location=no,scrollbars=no,resizable=yes,width=820, height=620");
		interfacewindow.focus();
		return true;
}

function setWindow_fs() {
	var interfacedetails="'toolbar=no, location=no,scrollbars=no,resizable=no, width=" + windowWidth +", height=" + windowHeight+"'"
	interfacewindow = window.open('data/main.html', 'interfacewindow',interfacedetails);
		interfacewindow.focus();
		return true;	
	}