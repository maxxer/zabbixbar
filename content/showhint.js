// JavaScript Document
/*
** ZABBIX
** Copyright (C) 2000-2007 SIA Zabbix
**
** This program is free software; you can redistribute it and/or modify
** it under the terms of the GNU General Public License as published by
** the Free Software Foundation; either version 2 of the License, or
** (at your option) any later version.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program; if not, write to the Free Software
** Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
**
*/

var hint_box = null;
function get_cursor_position(e){
        e = e || window.event;
        var cursor = {x:0, y:0};
        if(e.pageX || e.pageY){
                cursor.x = e.pageX;
                cursor.y = e.pageY;
        }
        else {  
                var de = document.documentElement;
                var b = document.body;
                cursor.x = e.clientX +
                (de.scrollLeft || b.scrollLeft) - (de.clientLeft || 0);
                cursor.y = e.clientY +
                (de.scrollTop || b.scrollTop) - (de.clientTop || 0);
        }
        return cursor;
}
function getPosition(obj){
        var pos = {top: 0, left: 0};
        if(typeof(obj.offsetParent) != 'undefined') {
                pos.left = obj.offsetLeft;
                pos.top = obj.offsetTop;
                while (obj = obj.offsetParent) {
                        pos.left += obj.offsetLeft;
                        pos.top += obj.offsetTop;
                }
        }
        return pos;
}

function hide_hint()
{
	if(!hint_box) return;

	hint_box.style.visibility="hidden";
	hint_box.style.left	= "-" + ((hint_box.style.width) ? hint_box.style.width : 100) + "px";
}

function show_hint(obj,  e, hint_text)
{
    hint_box=document.getElementById("hint_box");
    document.getElementById("issues-window").childNodes[0].style.display="none";
	show_hint_ext(obj, e, hint_text, "", "");
}
function show_systemhint(obj,  e, hint_text)
{
    hint_box=document.getElementById("systemhint_box");
    document.getElementById("systemstatus-window").childNodes[0].style.display="none";
	show_hint_ext(obj, e, hint_text.replace(/openurl="([^\"]*)"/g,"openurl='$1'").replace(/span/g,"div"), "", "");
}
function show_hint_ext(obj, e, hint_text, width, class_name)
{
	if(!hint_box) return;
	if(class_name != ""){
		hint_text = "<html:span class=" + class_name + ">" + hint_text + "</"+"html:span>";
	}

	hint_box.innerHTML = "<html:div style='width: 400px; display: block;'><html:em>Click on table to close</html:em>" +hint_text + '</html:div>';
	hint_box.style.display = "block";
	hint_box.style.visibility = "visible";
	//hint_box.style.width = width;

	var cursor = get_cursor_position(e);
	var pos = getPosition(obj);

	var body_width = 0;//get_bodywidth();

	if(parseInt(cursor.x+10+hint_box.offsetWidth) > body_width){
		cursor.x-=parseInt(hint_box.offsetWidth);
		cursor.x-=10;
		cursor.x=(cursor.x < 0)?0:cursor.x;
	}
	else{
		cursor.x+=10;
	}

	//hint_box.x	= -100;cursor.x;
	//hint_box.y	= 0;pos.top;

	//hint_box.style.left = cursor.x + "px";
//	hint_box.style.left	= hint_box.x + obj.offsetWidth + 10 + "px";
//	hint_box.style.top	= hint_box.y + obj.offsetHeight + "px";

	//obj.onclick	= hide_hint;
}

function update_hint(obj, e)
{
	if(!hint_box) return;
	if('undefined' == typeof(hint_box.y)) return;

	var cursor = get_cursor_position(e);
	var body_width = get_bodywidth();
	
	if(parseInt(cursor.x+10+hint_box.offsetWidth) > body_width){
		cursor.x-=parseInt(hint_box.offsetWidth);
		cursor.x-=10;
		cursor.x=(cursor.x < 0)?0:cursor.x;
	}
	else{
		cursor.x+=10;
	}

	hint_box.style.left     = cursor.x + "px";
//	hint_box.style.left		= hint_box.x + obj.offsetWidth + 10 + "px";
	hint_box.style.top      = hint_box.y + obj.offsetHeight + "px";
}

function create_hint_box()
{
	if(hint_box) return;

	hint_box = document.createElement("div");
	hint_box.setAttribute("id", "hint_box");
	hint_box.setAttribute("width", "200");
	hint_box.setAttribute("border", "1");
    hint_box.innerHTML="hola";
	document.getElementById("issues-window").childNodes[0].appendChild(hint_box);
      
	//hide_hint();
}

//-->
