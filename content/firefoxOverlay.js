/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is bar showing zabbix issues.
 *
 * The Initial Developer of the Original Code is
 * Alberto González Rodríguez.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */

var xmlHttp=new XMLHttpRequest();
var xmlHttp2=new XMLHttpRequest();
var xmlHttp3=new XMLHttpRequest();
var xmlHttp4=new XMLHttpRequest();
var prefManager = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefBranch);
var prefService = Components.classes["@mozilla.org/content-pref/service;1"]
                  .getService(Components.interfaces.nsIContentPrefService);

var auth = 0;
var id_interval_issues;
var id_interval_status;
var id_interval_webstatus;
var id_interval_systemstatus;
zabbixbar.onFirefoxLoad = function() {
  if(document.getElementById("contentAreaContextMenu")) {
      document.getElementById("contentAreaContextMenu")
              .addEventListener("popupshowing", function (e){ this.showFirefoxContextMenu(e); }, false);
  }
   if (prefManager.prefHasUserValue("extensions.zabbixbar.showed")) {
       bar=document.getElementById("zbcontainer");
       bar.collapsed=prefManager.getBoolPref("extensions.zabbixbar.showed");
   }

  var url =  prefManager.getCharPref("extensions.zabbixbar.url");
  var URIFactory = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
  URI = URIFactory.newURI(url,null,null);
  if(!prefService.getPref(URI,"refresh_issues")) {
      prefService.setPref(URI,"refresh_issues",60000);
  }
  if(!prefService.getPref(URI,"refresh_status")) {
      prefService.setPref(URI,"refresh_status",3600000);
  }
  if(!prefService.getPref(URI,"refresh_webstatus")) {
      prefService.setPref(URI,"refresh_webstatus",600000);
  }
  if(!prefService.getPref(URI,"refresh_systemstatus")) {
      prefService.setPref(URI,"refresh_systemstatus",60000);
  }
  zabbixbar.getIssues();
  if(prefService.getPref(URI,"refresh_issues") != "disabled") {
      id_interval_issues=setInterval("zabbixbar.getIssues()", prefService.getPref(URI,"refresh_issues"));
  } 
};
zabbixbar.refresh = function() {
  var url =  prefManager.getCharPref("extensions.zabbixbar.url");
  var URIFactory = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
  URI = URIFactory.newURI(url,null,null);
  if (prefService.getPref(URI,"refresh_issues") != "disabled") {
       zabbixbar.getIssues();
  } else {
      document.getElementById("issues-window").childNodes[0].innerHTML="<html:strong>Issues window disabled, to enable right-click on tab and choose time refresh</html:strong>";
  }
  if (prefService.getPref(URI,"refresh_status") != "disabled") {
       zabbixbar.getStatus();
  } else {
       document.getElementById("status-window").childNodes[0].innerHTML="<html:strong>Status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
  }
  if (prefService.getPref(URI,"refresh_webstatus") != "disabled") {
       zabbixbar.getWebStatus();
  } else {
       document.getElementById("webstatus-window").childNodes[0].innerHTML="<html:strong>Web status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
  }
  if (prefService.getPref(URI,"refresh_systemstatus") != "disabled") {
       zabbixbar.getSystemStatus();
  } else {
       document.getElementById("systemstatus-window").childNodes[0].innerHTML="<html:strong>System status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
  }
}
zabbixbar.resetChanges = function() {
    auth = 0;
    zabbixbar.getIssues();
}
zabbixbar.openOptions = function()  {
    window.openDialog('chrome://zabbixbar/content/options.xul', 'PrefWindow', 'chrome,titlebar,toolbar,centerscreen,dialog=no'); 
}
zabbixbar.updateInterval = function(t,esto) {
    var url =  prefManager.getCharPref("extensions.zabbixbar.url");
    var URIFactory = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    URI = URIFactory.newURI(url,null,null);
    //prefService.setPref(URI,
    for(i=0;i<esto.childNodes.length;i++) {
        if(esto.childNodes[i].getAttribute("checked")) {
           if(t == "refresh_issues") {
                if(prefService.getPref(URI,"refresh_issues") == "disabled" && esto.childNodes[i].value != "disabled") {
                    zabbixbar.getIssues();
                }
                prefService.setPref(URI,t,esto.childNodes[i].value);
                clearInterval(id_interval_issues);
                if(prefService.getPref(URI,"refresh_issues") != "disabled") {
                    id_interval_issues=setInterval("zabbixbar.getIssues()", prefService.getPref(URI,"refresh_issues"));
                } else {
                   document.getElementById("issues-window").childNodes[0].innerHTML="<html:strong>Issues window disabled, to enable right-click on tab and choose time refresh</html:strong>";
                }
           } else if(t == "refresh_status") {
                if(prefService.getPref(URI,"refresh_status") == "disabled" && esto.childNodes[i].value != "disabled") {
                    zabbixbar.getStatus();
                }
                prefService.setPref(URI,t,esto.childNodes[i].value);
                clearInterval(id_interval_status);
                if(prefService.getPref(URI,"refresh_status") != "disabled") {
                    id_interval_status=setInterval("zabbixbar.getStatus()", prefService.getPref(URI,"refresh_status"));
                } else {
                   document.getElementById("status-window").childNodes[0].innerHTML="<html:strong>Status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
                }
           } else if(t == "refresh_webstatus") {
                if(prefService.getPref(URI,"refresh_webstatus") == "disabled" && esto.childNodes[i].value != "disabled") {
                    zabbixbar.getWebStatus();
                }
                prefService.setPref(URI,t,esto.childNodes[i].value);
                clearInterval(id_interval_webstatus);
                if(prefService.getPref(URI,"refresh_webstatus") != "disabled") {
                    id_interval_webstatus=setInterval("zabbixbar.getWebStatus()", prefService.getPref(URI,"refresh_webstatus"));
                } else {
                   document.getElementById("webstatus-window").childNodes[0].innerHTML="<html:strong>Web status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
                }
           } else if(t == "refresh_systemstatus") {
                if(prefService.getPref(URI,"refresh_systemstatus") == "disabled" && esto.childNodes[i].value != "disabled") {
                    zabbixbar.getSystemStatus();
                }
                prefService.setPref(URI,t,esto.childNodes[i].value);
                clearInterval(id_interval_systemstatus);
                if(prefService.getPref(URI,"refresh_systemstatus") != "disabled") {
                    id_interval_systemstatus=setInterval("zabbixbar.getSystemStatus()", prefService.getPref(URI,"refresh_systemstatus"));
                } else {
                   document.getElementById("systemstatus-window").childNodes[0].innerHTML="<html:strong>System status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
                }
           }
        }
    }
}
zabbixbar.getIssues = function() {
   if (prefManager.prefHasUserValue("extensions.zabbixbar.username")) {
       var username =  prefManager.getCharPref("extensions.zabbixbar.username");
   } else {
       var username = "";
   }
   if (prefManager.prefHasUserValue("extensions.zabbixbar.password")) {
       var password =  prefManager.getCharPref("extensions.zabbixbar.password");
   } else {
       var password = "";
   }
   if (prefManager.prefHasUserValue("extensions.zabbixbar.url")) {
       var url =  prefManager.getCharPref("extensions.zabbixbar.url");
    } else {
        var url = "";
    }
    if (!prefManager.prefHasUserValue("extensions.zabbixbar.showack")) {
                   prefManager.setBoolPref("extensions.zabbixbar.showack",1);
    } 
   if(!password || !username || !url) {
       document.getElementById("issues-window").childNodes[0].innerHTML="<html:font color='red'>Please go to Tools -> Add-ons -> Zabbix options and configure url, username and password</html:font>";
   } else {
       if(!auth) {
           parameters="form=1&form_refresh=1&name=" + username + "&password=" + password + "&enter=Enter";
           xmlHttp.open("POST", url + "/index.php", true);
           xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
           xmlHttp.onload=zabbixbar.getIssuesHtml;
           xmlHttp.send(parameters); 
        } else {
           zabbixbar.getIssuesHtml();
        }
   }
}
zabbixbar.toggleBar = function(event) {
   if (event &&   event.button != 0) return;
   bar=document.getElementById("zbcontainer");
   bar.collapsed=bar.collapsed?false:true;
   prefManager.setBoolPref("extensions.zabbixbar.showed",bar.collapsed);
}
zabbixbar.toggleHide = function(e) {
   var bar=document.getElementById("zbcontainer");
   var checked = document.getElementById("autohide").getAttribute("checked");
   var url =  prefManager.getCharPref("extensions.zabbixbar.url");
   var URIFactory = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
   URI = URIFactory.newURI(url,null,null);
   prefService.setPref(URI,"autohide",checked);
   if(checked == true) {
     if(document.getElementById("zbStatusText").value == 0) {
        bar.collapsed=true;
     } else {
        bar.collapsed=false;
     }
   } 
}
zabbixbar.togglePopup = function(e) {
   var checked = document.getElementById("show_popup").getAttribute("checked");
   var url =  prefManager.getCharPref("extensions.zabbixbar.url");
   var URIFactory = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
   URI = URIFactory.newURI(url,null,null);
   prefService.setPref(URI,"show_popup",checked);
}


zabbixbar.toggleAck = function(e) {
  checked = document.getElementById("show_ack").getAttribute("checked");
  alerts=0;
  for (i=0;i<document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("html:tr").length;i++) {
        row = document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("html:tr")[i];
        if(row.getElementsByTagName("html:a")[0]) {
            if(row.getElementsByTagName("html:a")[1].innerHTML == "Yes") {
                if(checked) {
                    row.style.display="none";
                    alerts--;
                } else {
                    row.style.display="";
                }
            }
        alerts++;
        }
   }
  
   var url =  prefManager.getCharPref("extensions.zabbixbar.url");
   var URIFactory = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
   URI = URIFactory.newURI(url,null,null);
   prefService.setPref(URI,"show_ack",checked);
   document.getElementById("zbStatusText").value=alerts;
}
zabbixbar.toggleSeverity = function(t) {
    attribute = t.getAttribute("id"); 
    checked = t.getAttribute("checked");
    alerts=0;
    for (i=0;i<document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("html:tr").length;i++) {
        row = document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("html:tr")[i];
        if(row.getElementsByTagName("html:a")[0]) {
            if (row.getElementsByTagName("html:td")[1].getAttribute("class") == attribute) {
                if(checked) {
                    row.style.display="none";
                } else {
                    row.style.display="";
                }
            }
            if(row.style.display!="none") alerts++;
        }
   }
   var URIFactory = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
   var url =  prefManager.getCharPref("extensions.zabbixbar.url");
   URI = URIFactory.newURI(url,null,null);
   prefService.setPref(URI,attribute,checked);
   document.getElementById("zbStatusText").value=alerts;
   autohide = prefService.getPref(URI,"autohide");
   if(autohide == "true") {
     if(document.getElementById("zbStatusText").value == 0) {
        bar.collapsed=true;
     } else {
        bar.collapsed=false;
     }
   } 


}
zabbixbar.toggleAudio = function(t) {
    attribute = t.getAttribute("id"); 
    checked = t.getAttribute("checked");
    var URIFactory = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    var url =  prefManager.getCharPref("extensions.zabbixbar.url");
    URI = URIFactory.newURI(url,null,null);
    prefService.setPref(URI,attribute,checked);
}
zabbixbar.getIssuesHtml = function(e)  {
    if(!auth) {
        if (e.target.readyState == 4) {
            if (e.target.status == 200) {
                 var url =  prefManager.getCharPref("extensions.zabbixbar.url");
                 if(e.target.responseText.indexOf("web.index.login",0) > 0) {
                    auth = 0;
                 } else {
                    CookieInterface = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService); 
                    var URIFactory = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
                    CookieURI = URIFactory.newURI(url,null,null);
                    cookie = CookieInterface.getCookieString(CookieURI, null);
                    if(cookie) {
                        cookie=cookie.replace(/.*zbx_sessionid=.{16}(.{16}).*/,"$1");
                        prefManager.setCharPref("extensions.zabbixbar.sid",cookie);
                    }
                    auth = 1;
                    URI = URIFactory.newURI(url,null,null);
                    zabbixbar.refresh();

                    if(prefService.getPref(URI,"refresh_issues") != "disabled") {
                        zabbixbar.getIssues();
                        id_interval_issues=setInterval("zabbixbar.getIssues()", prefService.getPref(URI,"refresh_issues"));
                    } else {
                       document.getElementById("issues-window").childNodes[0].innerHTML="<html:strong>Issues window disabled, to enable right-click on tab and choose time refresh</html:strong>";
                    }
                    if(prefService.getPref(URI,"refresh_status") != "disabled") {
                        zabbixbar.getStatus();
                        id_interval_status=setInterval("zabbixbar.getStatus()", prefService.getPref(URI,"refresh_status"));
                    } else {
                       document.getElementById("status-window").childNodes[0].innerHTML="<html:strong>Status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
                    }
                    if(prefService.getPref(URI,"refresh_webstatus") != "disabled") {
                        zabbixbar.getWebStatus();
                        id_interval_webstatus=setInterval("zabbixbar.getWebStatus()", prefService.getPref(URI,"refresh_webstatus"));
                    } else {
                       document.getElementById("webstatus-window").childNodes[0].innerHTML="<html:strong>Web status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
                    }
                    if(prefService.getPref(URI,"refresh_systemstatus") != "disabled") {
                        zabbixbar.getSystemStatus();
                        id_interval_systemstatus=setInterval("zabbixbar.getSystemStatus()", prefService.getPref(URI,"refresh_systemstatus"));
                    } else {
                       document.getElementById("systemstatus-window").childNodes[0].innerHTML="<html:strong>System status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
                    }
                 if(prefService.getPref(URI,"refresh_issues") != "disabled") {
                     if(prefManager.prefHasUserValue("extensions.zabbixbar.url")) {
                         xmlHttp.open("GET", url + "/dashboard.php?output=html&favid=hat_lastiss&favobj=refresh&sid=" +  prefManager.getCharPref("extensions.zabbixbar.sid"), true);
                     } else {
                         xmlHttp.open("GET", url + "/dashboard.php?output=html&favid=hat_lastiss&favobj=refresh",true);
                     }
                     xmlHttp.send(false);
                 
                     xmlHttp.onload=zabbixbar.readDashBoard;
                } else {
                    zabbixbar.refresh();
                }
                }
            } else {
                 var url =  prefManager.getCharPref("extensions.zabbixbar.url");
                document.getElementById("issues-window").childNodes[0].innerHTML="<html:font color='red'>Error loading " + url + "/index.php Please go to Tools -> Add-ons -> Zabbix options and configure url</html:font>";
            }
      }
    } else {
        var url =  prefManager.getCharPref("extensions.zabbixbar.url");
        if(prefManager.prefHasUserValue("extensions.zabbixbar.sid")) {
                 xmlHttp.open("GET", url + "/dashboard.php?output=html&favid=hat_lastiss&favobj=refresh&sid=" +  prefManager.getCharPref("extensions.zabbixbar.sid"), true);
         } else {
                 xmlHttp.open("GET", url + "/dashboard.php?output=html&favid=hat_lastiss&favobj=refresh", true);
         }
        xmlHttp.send(false);
        xmlHttp.onload=zabbixbar.readDashBoard;
    }
}
zabbixbar.getStatus = function() {
        var url =  prefManager.getCharPref("extensions.zabbixbar.url");
        if(prefManager.prefHasUserValue("extensions.zabbixbar.sid")) {
                 xmlHttp2.open("GET", url + "/dashboard.php?output=html&favid=hat_stszbx&favobj=refresh&sid=" +  prefManager.getCharPref("extensions.zabbixbar.sid"), true);
         } else {
                 xmlHttp2.open("GET", url + "/dashboard.php?output=html&favid=hat_stszbx&favobj=refresh", true);
         }
        xmlHttp2.send(false);
        xmlHttp2.onload=zabbixbar.readStatusDashBoard;
}
zabbixbar.getSystemStatus = function() {
        var url =  prefManager.getCharPref("extensions.zabbixbar.url");
        if(prefManager.prefHasUserValue("extensions.zabbixbar.sid")) {
                 xmlHttp3.open("GET", url + "/dashboard.php?output=html&favid=hat_syssum&favobj=refresh&sid=" +  prefManager.getCharPref("extensions.zabbixbar.sid"), true);
         } else {
                 xmlHttp3.open("GET", url + "/dashboard.php?output=html&favid=hat_syssum&favobj=refresh", true);
         }
        xmlHttp3.send(false);
        xmlHttp3.onload=zabbixbar.readSystemStatusDashBoard;
}
zabbixbar.getWebStatus = function() {
    var url =  prefManager.getCharPref("extensions.zabbixbar.url");
    if(prefManager.prefHasUserValue("extensions.zabbixbar.sid")) {
        urlwebstatus = url + "/httpmon.php?fullscreen=1&groupid=0&hostid=0&sid=" +  prefManager.getCharPref("extensions.zabbixbar.sid");
    } else {
        urlwebstatus = url + "/httpmon.php?fullscreen=1&groupid=0&hostid=0";
    }
    var url =  prefManager.getCharPref("extensions.zabbixbar.url");
    var frame = document.getElementById("hidden-frame");
    if (!frame) {
        frame = document.createElement("iframe");
        frame.setAttribute("id", "hidden-frame");
        frame.setAttribute("name", "hidden-frame");
        frame.setAttribute("type", "content");
        frame.style.setProperty('min-height', "0px", 'important');
        frame.style.setProperty("height", "0px;", 'important');
        frame.addEventListener("load", function (event) {
                document.getElementById("webstatus-window").childNodes[0].innerHTML= '<html:table class="tableinfo" cellpadding="3" cellspacing="1">' + frame.contentDocument.getElementsByTagName("table")[1].innerHTML.replace(/&nbsp;/g,"").replace(/<([^\/])/g,"<html:$1").replace(/<\//g,"</html:").replace(/href="([^\"]+)"/g,'href="#" onclick="javascript:parent.gBrowser.loadOneTab(\'' + url + "/$1',null,null,null,false,false)\"") + frame.contentDocument.getElementsByTagName("table")[4].innerHTML.replace(/&nbsp;/g,"").replace(/<([^\/])/g,"<html:$1").replace(/<\//g,"</html:").replace(/href="([^\"]+)"/g,'href="#" onclick="javascript:parent.gBrowser.loadOneTab(\'' + url + "/$1',null,null,null,false,false)\"").replace(/<html:img[^>]*>/g,"") + '</html:table>';
                document.getElementById("webstatus-window").removeChild(frame);
                }, true);
    }
    childFrame = document.getElementById("webstatus-window").appendChild(frame);
    frame.contentDocument.location.href = urlwebstatus;
}
zabbixbar.readStatusDashBoard = function(e)  {
    if (e.target.readyState == 4) {
        if (e.target.status == 200) {
            var url =  prefManager.getCharPref("extensions.zabbixbar.url");
            document.getElementById("status-window").childNodes[0].innerHTML= '<html:span>' +  e.target.responseText.toString().replace(/&nbsp;/g,"").replace(/<([^\/])/g,"<html:$1").replace(/<\//g,"</html:").replace(/onclick=".+(latest[^\']+)[^\"]*"/g,"onclick=\"javascript:parent.gBrowser.loadOneTab('" + url + "/$1')\"").replace(/href="([^\"]+)"/g,' style="cursor: pointer;" onclick="javascript:parent.gBrowser.loadOneTab(\'' + url + "/$1',null,null,null,false,false)\"").replace(/onMouseOver/g,"href") + '</html:span>';
        } 
    }
}
zabbixbar.readSystemStatusDashBoard = function(e)  {
    if (e.target.readyState == 4) {
        if (e.target.status == 200) {
            var url =  prefManager.getCharPref("extensions.zabbixbar.url");
            document.getElementById("systemstatus-window").childNodes[0].innerHTML= '<html:span>' +  e.target.responseText.toString().replace(/&nbsp;/g,"").replace(/<([^\/])/g,"<html:$1").replace(/<\//g,"</html:").replace(/onclick=".+(latest[^\']+)[^\"]*"/g,"onclick=\"javascript:parent.gBrowser.loadOneTab('" + url + "/$1')\"").replace(/href="([^\"]+)"/g,' style="cursor: pointer;" onclick="javascript:parent.gBrowser.loadOneTab(\'' + url + "/$1',null,null,null,false,false)\"").replace(/onMouseOver/g,"onclick").replace(/show_hint/g,"show_systemhint").replace(/&lt;([^\/])/g,"&lt;html:$1").replace(/&lt;\//g,"&lt;/html:").replace(/href=&quot;(\S+)&quot;/g,'onclick=&quot;' + 'openurl=&#92;&quot;' + url +"/$1" + '&#92;&quot;;parent.gBrowser.loadOneTab(openurl,null,null,null,false,false);&quot; style=&quot;cursor: pointer;&quot;') + '</html:span>';
            
        } 
    }
}

zabbixbar.readDashBoard = function(e)  {
    if (e.target.readyState == 4) {
        if (e.target.status == 200) {
             var url =  prefManager.getCharPref("extensions.zabbixbar.url");
             document.getElementById("issues-window").childNodes[0].innerHTML= '<html:span>' +  e.target.responseText.toString().replace(/&nbsp;/g,"").replace(/<([^\/])/g,"<html:$1").replace(/<\//g,"</html:").replace(/onclick=".+(latest[^\']+)[^\"]*"/g,"onclick=\"javascript:parent.gBrowser.loadOneTab('" + url + "/$1')\"").replace(/href="([^\"]+)"/g,' style="cursor: pointer;" onclick="javascript:parent.gBrowser.loadOneTab(\'' + url + "/$1',null,null,null,false,false)\"").replace(/onMouseOver/g,"href").replace(/&lt;([^\/])/g,"&lt;html:$1").replace(/&lt;\//g,"&lt;/html:").replace(/span class="green" href/g,'span style="cursor: pointer;" class="green" onclick') + '</html:span>';
            if (prefManager.prefHasUserValue("extensions.zabbixbar.showack")) {
                   var showack =  prefManager.getBoolPref("extensions.zabbixbar.showack");
            } else {
                   var showack = 1;
            }
               alerts=0;
               alert_host="";
               alert_issue="";
               alert_severity="";
               for (i=0;i<document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("html:tr").length;i++) {
                    row = document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("html:tr")[i];

                    if(row.getElementsByTagName("html:a")[0]) {
                            var URIFactory = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
                            var url =  prefManager.getCharPref("extensions.zabbixbar.url");
                            URI = URIFactory.newURI(url,null,null);
                            if(prefService.getPref(URI,row.getElementsByTagName("html:td")[1].getAttribute("class"))) {
                                    row.style.display="none";
                                    alerts--;
                            }
                            if(prefService.getPref(URI,"show_ack")) {
                                if(row.getElementsByTagName("html:a")[1].innerHTML == "Yes") {
                                    row.style.display="none";
                                    alerts--;
                                }
                            }
                            if(!alert_host) {
                                alert_host=row.getElementsByTagName("html:td")[0].childNodes[1].innerHTML;
                                alert_issue=row.getElementsByTagName("html:td")[1].innerHTML;
                                alert_time=row.getElementsByTagName("html:td")[2].childNodes[1].innerHTML;
                                alert_severity=row.getElementsByTagName("html:td")[1].getAttribute("class");
                            }
                            alerts++;
                        }
               }
               var URIFactory = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
               var url =  prefManager.getCharPref("extensions.zabbixbar.url");
               URI = URIFactory.newURI(url,null,null);
               if(document.getElementById("zbStatusText").value && alerts > document.getElementById("zbStatusText").value) {
                    document.getElementById("zbNotification").label = alert_time + ": New alert on host " + alert_host + ": " + alert_issue;
                    if(alert_severity == "information") {
                        document.getElementById("zbNotification").type = "info";
                    } else if(alert_severity == "warning" || alert_severity == "average") {
                        document.getElementById("zbNotification").type = "warning";
                    } else if(alert_severity == "high" || alert_severity == "critical" || alert_severity == "disaster") {
                        document.getElementById("zbNotification").type = "critical";
                    }
                    document.getElementById("zbNotification").style.display="";
                    document.getElementById("zbNotification").hidden=false;
                    if (prefService.getPref(URI,"audio_" + alert_severity)) {
                        var wav = "chrome://zabbixbar/content/audio/trigger_on_" + alert_severity + ".wav";
                        var sound = Components.classes["@mozilla.org/sound;1"].createInstance(Components.interfaces.nsISound);
                        var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService); 
                        var soundUri = ioService.newURI(wav, null, null);
                        sound.play(soundUri);

                    }
                    //todo
                     if (prefService.getPref(URI,"show_popup")) {
                        var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
                              .getService(Components.interfaces.nsIAlertsService);
                            alertsService.showAlertNotification("chrome://zabbixbar/skin/zabbixbar.png", 
                                    alert_time + ": New " + alert_severity + " alert on " + alert_host, alert_issue, 
                                    false, "", null);
                    }

               }
               if(!document.getElementById("zbStatusText").value) {
                    zabbixbar.refresh();
               }
               document.getElementById("zbStatusText").value=alerts;

               if(prefService.getPref(URI,"autohide")) {
                    if(document.getElementById("zbStatusText").value == 0) {
                        bar.collapsed=true;
                    } else {
                        bar.collapsed=false;
                    }
               }



        } 
    }
}
zabbixbar.onOptionsShowing =  function(popup) {  
    for (var child = popup.firstChild; child; child = child.nextSibling) {  
        if (child.localName == "menuitem") {  
            var option = child.getAttribute("id");
            if (option) {  
                var URIFactory = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
                var url =  prefManager.getCharPref("extensions.zabbixbar.url");
                URI = URIFactory.newURI(url,null,null);
                if(prefService.getPref(URI,option))
                    child.setAttribute("checked", "true");
            }
        }
    }
}
window.addEventListener("load", function(e) { zabbixbar.onFirefoxLoad(e); }, false);

