/*
Copyright (c) 2012, robert.r.h.vella@gmail.com
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met: 

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer. 
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those
of the authors and should not be interpreted as representing official policies, 
either expressed or implied, of the FreeBSD Project.
*/

window.onload = function() { 
	//The pattern of the Conway object selected by the user, from the 
	//toolbar.
	var currentPattern = null;

	//The toolbar containing the conway objects.
	var conwayToolbar = new conway.ConwayToolbar(document
					.getElementById("gameOfLifeToolbar"));
	
	//The area containing the conway scene.
	var conwayArea = new conway.ConwayArea(document
						.getElementById("gameOfLife")
						.getContext("2d"), 15, 256, 192);
	
	//When a button in the toolbar is clicked, set the selected pattern
	//to the pattern of the object.
	conwayToolbar.onElementSelected = function(selectedPattern) {
		currentPattern = selectedPattern;
	};

	//When the area is clicked, place the pattern at that position.
	conwayArea.onclick = function(x, y) {
		conwayArea.placePattern(currentPattern, x, y);
	};

	//When the space bar is pressed, toggle the animation.
	window.onkeypress = function (evt) {
		var event = (evt || event);

		if(event.charCode == 32 || event.keyCode == 32) {
			conwayArea.animate = !conwayArea.animate;
		}
	};

	//Start rendering the scene.
	conwayArea.run();

};
