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
var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance();
messenger = messenger.QueryInterface(Components.interfaces.nsIMessenger);

var auth = 0;
var id_interval_issues;
var id_interval_status;
var id_interval_webstatus;
var id_interval_systemstatus;
zabbixbar.onThunderbirdLoad = function() {
  if(document.getElementById("contentAreaContextMenu")) {
      document.getElementById("contentAreaContextMenu")
              .addEventListener("popupshowing", function (e){ this.showFirefoxContextMenu(e); }, false);
  }
  if(!prefManager.prefHasUserValue("extensions.zabbixbar.url")) {
      prefManager.setCharPref("extensions.zabbixbar.url","");
  }
      var url =  prefManager.getCharPref("extensions.zabbixbar.url");
  
  if(!prefManager.prefHasUserValue("extensions.zabbixbar.refresh_issues")) {
           prefManager.setCharPref("extensions.zabbixbar.refresh_issues",60000);
  }
  if(!prefManager.prefHasUserValue("extensions.zabbixbar.refresh_status")) {
           prefManager.setCharPref("extensions.zabbixbar.refresh_status",3600000);
  }
  if(!prefManager.prefHasUserValue("extensions.zabbixbar.refresh_webstatus")) {
           prefManager.setCharPref("extensions.zabbixbar.refresh_webstatus",600000);
  }
  if(!prefManager.prefHasUserValue("extensions.zabbixbar.refresh_systemstatus")) {
           prefManager.setCharPref("extensions.zabbixbar.refresh_systemstatus",60000);
  }
  zabbixbar.getIssues();
  if(prefManager.getCharPref("extensions.zabbixbar.refresh_issues") != "disabled") {
      id_interval_issues=setInterval("zabbixbar.getIssues()", prefManager.getCharPref("extensions.zabbixbar.refresh_issues"));
  } 
};
zabbixbar.resetChanges = function() {
    auth = 0;
    zabbixbar.getIssues();
};
zabbixbar.refresh = function() {
       if (prefManager.getCharPref("extensions.zabbixbar.refresh_issues") != "disabled") {
            zabbixbar.getIssues();
       } else {
            document.getElementById("issues-window").childNodes[0].innerHTML="<html:strong>Issues window disabled, to enable right-click on tab and choose time refresh</html:strong>";
       }
       if (prefManager.getCharPref("extensions.zabbixbar.refresh_status") != "disabled") {
            zabbixbar.getStatus();
       } else {
            document.getElementById("status-window").childNodes[0].innerHTML="<html:strong>Status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
       }
       if (prefManager.getCharPref("extensions.zabbixbar.refresh_webstatus") != "disabled") {
            zabbixbar.getWebStatus();
       } else {
            document.getElementById("webstatus-window").childNodes[0].innerHTML="<html:strong>Web status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
       }
       if (prefManager.getCharPref("extensions.zabbixbar.refresh_systemstatus") != "disabled") {
            zabbixbar.getSystemStatus();
       } else {
            document.getElementById("webstatus-window").childNodes[0].innerHTML="<html:strong>System status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
       }
}
zabbixbar.updateInterval = function(t,esto) {
    var url =  prefManager.getCharPref("extensions.zabbixbar.url");
    for(i=0;i<esto.childNodes.length;i++) {
        if(esto.childNodes[i].getAttribute("checked")) {
           if(t == "refresh_issues") {
                if(prefManager.getCharPref("extensions.zabbixbar.refresh_issues") == "disabled" && esto.childNodes[i].value != "disabled") {
                    zabbixbar.getIssues();
                }
                prefManager.setCharPref("extensions.zabbixbar." + t,esto.childNodes[i].value);
                clearInterval(id_interval_issues);
                if(prefManager.getCharPref("extensions.zabbixbar.refresh_issues") != "disabled") {
                    id_interval_issues=setInterval("zabbixbar.getIssues()", prefManager.getCharPref("extensions.zabbixbar.refresh_issues"));
                } else {
                   document.getElementById("issues-window").childNodes[0].innerHTML="<html:strong>Issues window disabled, to enable right-click on tab and choose time refresh</html:strong>";
                }
           } else if(t == "refresh_status") {
                if(prefManager.getCharPref("extensions.zabbixbar.refresh_status") == "disabled" && esto.childNodes[i].value != "disabled") {
                    zabbixbar.getStatus();
                }
                prefManager.setCharPref("extensions.zabbixbar." + t,esto.childNodes[i].value);
                clearInterval(id_interval_status);
                if(prefManager.getCharPref("extensions.zabbixbar.refresh_status") != "disabled") {
                    id_interval_status=setInterval("zabbixbar.getStatus()", prefManager.getCharPref("extensions.zabbixbar.refresh_status"));
                } else {
                   document.getElementById("status-window").childNodes[0].innerHTML="<html:strong>Status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
                }
           } else if(t == "refresh_webstatus") {
                if(prefManager.getCharPref("extensions.zabbixbar.refresh_webstatus") == "disabled" && esto.childNodes[i].value != "disabled") {
                    zabbixbar.getWebStatus();
                }
                prefManager.setCharPref("extensions.zabbixbar." + t,esto.childNodes[i].value);
                clearInterval(id_interval_webstatus);
                if(prefManager.getCharPref("extensions.zabbixbar.refresh_webstatus") != "disabled") {
                    id_interval_webstatus=setInterval("zabbixbar.getWebStatus()", prefManager.getCharPref("extensions.zabbixbar.refresh_webstatus"));
                } else {
                   document.getElementById("webstatus-window").childNodes[0].innerHTML="<html:strong>Web status window disabled, to enable right-click on tab and choose time refresh</html:strong>";
                }
           } else if(t == "refresh_systemstatus") {
                if(prefManager.getCharPref("extensions.zabbixbar.refresh_systemstatus") == "disabled" && esto.childNodes[i].value != "disabled") {
                    zabbixbar.getSystemStatus();
                }
                prefManager.setCharPref("extensions.zabbixbar." + t,esto.childNodes[i].value);
                clearInterval(id_interval_systemstatus);
                if(prefManager.getCharPref("extensions.zabbixbar.refresh_systemstatus") != "disabled") {
                    id_interval_systemstatus=setInterval("zabbixbar.getSystemStatus()", prefManager.getCharPref("extensions.zabbixbar.refresh_systemstatus"));
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
}
zabbixbar.toggleAck = function(e) {
  checked = document.getElementById("show_ack").getAttribute("checked");
  alerts=0;
  for (i=0;i<document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("tr").length;i++) {
        row = document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("tr")[i];
        if(row.getElementsByTagName("a")[0]) {
            if(row.getElementsByTagName("a")[1].innerHTML == "Yes") {
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
   prefManager.setCharPref("extensions.zabbixbar.show_ack",checked);
   document.getElementById("zbStatusText").value=alerts;
}
zabbixbar.toggleSeverity = function(t) {
    attribute = t.getAttribute("id"); 
    checked = t.getAttribute("checked")?t.getAttribute("checked"):false;
    alerts=0;
    for (i=0;i<document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("tr").length;i++) {
        row = document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("tr")[i];
        if(row.getElementsByTagName("a")[0]) {
            if (row.getElementsByTagName("td")[1].getAttribute("class") == attribute) {
                if(checked) {
                    row.style.display="none";
                } else {
                    row.style.display="";
                }
            }
            if(row.style.display!="none") alerts++;
        }
   }
   var url =  prefManager.getCharPref("extensions.zabbixbar.url");
   prefManager.setBoolPref("extensions.zabbixbar." + attribute,checked?1:0);
   document.getElementById("zbStatusText").value=alerts;
}
zabbixbar.toggleAudio= function(t) {
    attribute = t.getAttribute("id"); 
    checked = t.getAttribute("checked")?t.getAttribute("checked"):false;
    var url =  prefManager.getCharPref("extensions.zabbixbar.url");
    prefManager.setBoolPref("extensions.zabbixbar." + attribute,checked?1:0);
}
zabbixbar.toggleSeverity = function(t) {
    attribute = t.getAttribute("id"); 
    checked = t.getAttribute("checked")?t.getAttribute("checked"):false;
    alerts=0;
    for (i=0;i<document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("tr").length;i++) {
        row = document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("tr")[i];
        if(row.getElementsByTagName("a")[0]) {
            if (row.getElementsByTagName("td")[1].getAttribute("class") == attribute) {
                if(checked) {
                    row.style.display="none";
                } else {
                    row.style.display="";
                }
            }
            if(row.style.display!="none") alerts++;
        }
   }
   var url =  prefManager.getCharPref("extensions.zabbixbar.url");
   prefManager.setBoolPref("extensions.zabbixbar." + attribute,checked?1:0);
   document.getElementById("zbStatusText").value=alerts;
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
                    cookie=cookie.replace(/.*zbx_sessionid=.{16}(.{16}).*/,"$1");
                    prefManager.setCharPref("extensions.zabbixbar.sid",cookie);
                    auth = 1;
                    URI = URIFactory.newURI(url,null,null);
                    if(prefManager.prefHasUserValue("extensions.zabbixbar.refresh_status") && prefManager.getCharPref("extensions.zabbixbar.refresh_status") != "disabled") {
                        id_interval_status=setInterval("zabbixbar.getStatus()", prefManager.getCharPref("extensions.zabbixbar.refresh_status"));
                    }
                    if(prefManager.prefHasUserValue("extensions.zabbixbar.refresh_webstatus") && prefManager.getCharPref("extensions.zabbixbar.refresh_webstatus") != "disabled") {
                        id_interval_webstatus=setInterval("zabbixbar.getWebStatus()", prefManager.getCharPref("extensions.zabbixbar.refresh_webstatus"));
                    }
                    if(prefManager.prefHasUserValue("extensions.zabbixbar.refresh_systemstatus") && prefManager.getCharPref("extensions.zabbixbar.refresh_systemstatus") != "disabled") {
                        id_interval_systemstatus=setInterval("zabbixbar.getSystemStatus()", prefManager.getCharPref("extensions.zabbixbar.refresh_systemstatus"));
                    }
                 }
                 if(prefManager.prefHasUserValue("extensions.zabbixbar.refresh_issues") != "disabled") {
                     if(prefManager.prefHasUserValue("extensions.zabbixbar.url")) {
                         xmlHttp.open("GET", url + "/dashboard.php?output=html&favid=hat_lastiss&favobj=refresh&sid=" +  prefManager.getCharPref("extensions.zabbixbar.sid"), true);
                     } else {
                         xmlHttp.open("GET", url + "/dashboard.php?output=html&favid=hat_lastiss&favobj=refresh",true);
                     }
                     xmlHttp.send(false);
                 
                     xmlHttp.onload=zabbixbar.readDashBoard;
                } else {
                    URI = URIFactory.newURI(url,null,null);
                    zabbixbar.refresh();
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
        xmlHttp2.onload=zabbixbar.readStatusDashBoard;
        xmlHttp2.send(false);
}
zabbixbar.getWebStatus = function() {
        var url =  prefManager.getCharPref("extensions.zabbixbar.url");
        if(prefManager.prefHasUserValue("extensions.zabbixbar.sid")) {
                 urlwebstatus = url + "/httpmon.php?fullscreen=1&groupid=0&hostid=0&sid=" +  prefManager.getCharPref("extensions.zabbixbar.sid");
         } else {
                 urlwebstatus = url + "/httpmon.php?fullscreen=1&groupid=0&hostid=0";
        }
        xmlHttp3=new XMLHttpRequest();
        xmlHttp3.open("GET", urlwebstatus, true);
        xmlHttp3.onload=zabbixbar.readHttpMon;
        xmlHttp3.send(false);
}
zabbixbar.getSystemStatus = function() {
        var url =  prefManager.getCharPref("extensions.zabbixbar.url");
        if(prefManager.prefHasUserValue("extensions.zabbixbar.sid")) {
                 xmlHttp4.open("GET", url + "/dashboard.php?output=html&favid=hat_syssum&favobj=refresh&sid=" +  prefManager.getCharPref("extensions.zabbixbar.sid"), true);
         } else {
                 xmlHttp4.open("GET", url + "/dashboard.php?output=html&favid=hat_syssum&favobj=refresh", true);
         }
        xmlHttp4.send(false);
        xmlHttp4.onload=zabbixbar.readSystemStatusDashBoard;
}

zabbixbar.readSystemStatusDashBoard = function(e)  {
    if (e.target.readyState == 4) {
        if (e.target.status == 200) {
            var url =  prefManager.getCharPref("extensions.zabbixbar.url");
            document.getElementById("systemstatus-window").childNodes[0].innerHTML= '<html:span>' +  e.target.responseText.toString().replace(/&nbsp;/g,"").replace(/<([^\/])/g,"<html:$1").replace(/<\//g,"</html:").replace(/onclick=".+(latest[^\']+)[^\"]*"/g,"onclick=\"javascript::messenger.launchExternalURL('" + url + "/$1')\"").replace(/href="([^\"]+)"/g,' style="cursor: pointer;" onclick="javascript::messenger.launchExternalURL(\'' + url + "/$1')\"").replace(/onMouseOver/g,"onclick").replace(/show_hint/g,"show_systemhint").replace(/&lt;([^\/])/g,"&lt;html:$1").replace(/&lt;\//g,"&lt;/html:").replace(/href=&quot;(\S+)&quot;/g,'onclick=&quot;' + 'openurl=&#92;&quot;' + url +"/$1" + '&#92;&quot;;:messenger.launchExternalURL(openurl);&quot; style=&quot;cursor: pointer;&quot;') + '</html:span>';
            
        } 
    }
}

zabbixbar.readHttpMon = function(e) {
    if (e.target.readyState == 4) {
        if (e.target.status == 200) {
            var url =  prefManager.getCharPref("extensions.zabbixbar.url");
            document.getElementById("webstatus-window").childNodes[0].innerHTML= '<html:div>' +  e.target.responseText.toString().substring(e.target.responseText.toString().indexOf('<table class="tableinfo"')-1,e.target.responseText.toString().indexOf("</form>\n</div></td>")-1).replace(/&nbsp;/g,"").replace(/<([^\/])/g,"<html:$1").replace(/<\//g,"</html:").replace(/onclick=".+(latest[^\']+)[^\"]*"/g,"onclick=\"javascript:document.open('" + url + "/$1')\"").replace(/href="([^\"]+)"/g,' style="cursor: pointer;" href="' + url + "/$1" + '"') +  '</html:div>';
        }
    }
}
zabbixbar.readStatusDashBoard = function(e)  {
    if (e.target.readyState == 4) {
        if (e.target.status == 200) {
            var url =  prefManager.getCharPref("extensions.zabbixbar.url");
            document.getElementById("status-window").childNodes[0].innerHTML= '<html:div>' +  e.target.responseText.toString().replace(/&nbsp;/g,"").replace(/<([^\/])/g,"<html:$1").replace(/<\//g,"</html:").replace(/onclick=".+(latest[^\']+)[^\"]*"/g,"onclick=\"javascript::messenger.launchExternalURL('" + url + "/$1')\"").replace(/href="([^\"]+)"/g,' style="cursor: pointer;" href="' + url + "/$1" + '"') +  '</html:div>';
        } 
    }
}

zabbixbar.readDashBoard = function(e)  {
    if (e.target.readyState == 4) {
        if (e.target.status == 200) {
             var url =  prefManager.getCharPref("extensions.zabbixbar.url");
             document.getElementById("issues-window").childNodes[0].innerHTML= '<html:div>' +  e.target.responseText.toString().replace(/&nbsp;/g,"").replace(/<([^\/])/g,"<html:$1").replace(/<\//g,"</html:").replace(/onclick=".+(latest[^\']+)[^\"]*"/g,"onclick=\"javascript:messenger.launchExternalURL('" + url + "/$1'" + ')"').replace(/href="([^\"]+)"/g,' style="cursor: pointer;" href="' + url + "/$1" + '"').replace(/&lt;([^\/])/g,"&lt;html:$1").replace(/&lt;\//g,"&lt;/html:").replace(/div class="green" href/g,'div style="cursor: pointer;" class="green" onclick').replace(/onMouseOver/g,"onclick") + '</html:div>';
            if (prefManager.prefHasUserValue("extensions.zabbixbar.showack")) {
                   var showack =  prefManager.getBoolPref("extensions.zabbixbar.showack");
            } else {
                   var showack = 1;
            }
               alerts=0;
               alert_host="";
               alert_issue="";
               alert_severity="";
               for (i=0;i<document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("tr").length;i++) {
                    row = document.getElementById("issues-window").childNodes[0].childNodes[0].childNodes[0].getElementsByTagName("tr")[i];

                    if(row.getElementsByTagName("a")[0]) {
                            var URIFactory = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
                            var url =  prefManager.getCharPref("extensions.zabbixbar.url");
                            URI = URIFactory.newURI(url,null,null);
                            if(prefManager.prefHasUserValue("extensions.zabbixbar." + row.getElementsByTagName("td")[1].getAttribute("class")) && prefManager.getBoolPref("extensions.zabbixbar." + row.getElementsByTagName("td")[1].getAttribute("class")) == true) {
                                    row.style.display="none";
                                    alerts--;
                            }
                            if(prefManager.prefHasUserValue("extensions.zabbixbar.show_ack") && prefManager.getBoolPref("extensions.zabbixbar.show_ack") == true) {
                                if(row.getElementsByTagName("a")[1].innerHTML == "Yes") {
                                    row.style.display="none";
                                    alerts--;
                                }
                            }
                            if(!alert_host) {
                                alert_host=row.getElementsByTagName("td")[0].childNodes[1].innerHTML;
                                alert_issue=row.getElementsByTagName("td")[1].innerHTML;
                                alert_severity=row.getElementsByTagName("td")[1].getAttribute("class");
                            }
                            alerts++;
                        }
               }
               if(document.getElementById("zbStatusText").value && alerts > document.getElementById("zbStatusText").value) {
                    document.getElementById("zbNotification").label = "New alert on host " + alert_host + ": " + alert_issue;
                    if(alert_severity == "information") {
                        document.getElementById("zbNotification").type = "info";
                    } else if(alert_severity == "warning" || alert_severity == "average") {
                        document.getElementById("zbNotification").type = "warning";
                    } else if(alert_severity == "high" || alert_severity == "critical") {
                        document.getElementById("zbNotification").type = "critical";
                    }
                    document.getElementById("zbNotification").style.display="";
                    document.getElementById("zbNotification").hidden=false;
                    if (prefManager.prefHasUserValue("extensions.zabbixbar.audio_" + alert_severity) && prefManager.getBoolPref("extensions.zabbixbar.audio_" + alert_severity)) {
                        var wav = "chrome://zabbixbar/content/audio/trigger_on_" + alert_severity + ".wav";
                        var sound = Components.classes["@mozilla.org/sound;1"].createInstance(Components.interfaces.nsISound);
                        var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService); 
                        var soundUri = ioService.newURI(wav, null, null);
                        sound.play(soundUri);
                    }

               }

               if(!document.getElementById("zbStatusText").value) {
                    zabbixbar.refresh();
               }
               document.getElementById("zbStatusText").value=alerts;
        } 
    }
}
zabbixbar.onOptionsShowing =  function(popup) {  
    for (var child = popup.firstChild; child; child = child.nextSibling) {  
        if (child.localName == "menuitem") {  
            var option = child.getAttribute("id");
            if (option) {  
                if(prefManager.prefHasUserValue("extensions.zabbixbar." + option))
                    child.setAttribute("checked", prefManager.getBoolPref("extensions.zabbixbar." + option));
            }
        }
    }
}
window.addEventListener("load", function(e) { zabbixbar.onThunderbirdLoad(e); }, false);

