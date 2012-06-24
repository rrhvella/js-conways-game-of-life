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

/*
Contains all the classes needed to render and manage a scene with Conway's 
game of life.
*/
(function (conway) {
	/*
	The number of elements in a 2D canvas pixel.
	*/
	var ELEMENTS_IN_PIXEL = 4;
	/*
	The index of the alpha element in a 2D canvas pixel.
	*/
	var ALPHA_POSITION = 3;

	/*
	The width and height of a toolbar button, in logical pixels.
	*/
	var TOOLBAR_CELL_WIDTH = 16;
	/*
	The width and height of a toolbar button, in canvas pixels.
	*/
	var TOOLBAR_CANVAS_WIDTH = 40;

	/*
	The conway object patterns which are displayed in the toolbar. 1 means
	that the pixel is alive, 0 means that it's dead.
	*/
	var patterns = [
		[[1,1],
		 [1,1]],

		[[0,1,1,0],
		 [1,0,0,1],
		 [0,1,1,0]],

		[[0,1,1,0],
		 [1,0,0,1],
		 [0,1,0,1],
		 [0,0,1,0]],

		[[1,1,0],
		 [1,0,1],
		 [0,1,0]],

		[[0,1,1,1],
		 [1,1,1,0]],

		[[1,1,1]],

		[[1,1,0,0],
		 [1,1,0,0],
		 [0,0,1,1],
		 [0,0,1,1]],

		[[0,0,1,1,0,0,0,0,0,1,1,0,0],
		 [0,0,0,1,1,0,0,0,1,1,0,0,0],
		 [1,0,0,1,0,1,0,1,0,1,0,0,1],
		 [1,1,1,0,1,1,0,1,1,0,1,1,1],
		 [0,1,0,1,0,1,0,1,0,1,0,1,0],
		 [0,0,1,1,1,0,0,0,1,1,1,0,0],
		 [0,0,0,0,0,0,0,0,0,0,0,0,0],
		 [0,0,1,1,1,0,0,0,1,1,1,0,0],
		 [0,1,0,1,0,1,0,1,0,1,0,1,0],
		 [1,1,1,0,1,1,0,1,1,0,1,1,1],
		 [1,0,0,1,0,1,0,1,0,1,0,0,1],
		 [0,0,0,1,1,0,0,0,1,1,0,0,0],
		 [0,0,1,1,0,0,0,0,0,1,1,0,0]],

		[[0,1,0],
		 [0,0,1],
		 [1,1,1]],

		[[0,0,1,1,0],
		 [1,1,0,1,1],
		 [1,1,1,1,0],
		 [0,1,1,0,0]],

		[[0,1,1],
		 [1,1,0],
		 [0,1,0]],

		[[0,0,0,0,0,0,1,0],
		 [1,1,0,0,0,0,0,0],
		 [0,1,0,0,0,1,1,1]],

		[[0,0,0,0,0,0,1,0],
		 [0,0,0,0,1,0,1,1],
		 [0,0,0,0,1,0,1,0],
		 [0,0,0,0,1,0,0,0],
		 [0,0,1,0,0,0,0,0],
		 [1,0,1,0,0,0,0,0]],

		[[1,1,1,0,1],
		 [1,0,0,0,0],
		 [0,0,0,1,1],
		 [0,1,1,0,1],
		 [1,0,1,0,1]]
	];
	
	/*
	Builds, draws and manages the toolbar which contains the object buttons.

	Parameters:
		parentElement - The html element in which the toolbar will be 
				drawn.
	*/
	conway.ConwayToolbar = function (parentElement) {
		var self = this;

		//The factory for the toolbar buttons' onclick function.
		var elementClickFunction = function (pattern) {
			return function() { 
				/*
				If an onclick function has been registered, call
				it and pass this button's pattern.
				*/
				if(self.onElementSelected) {;
					self.onElementSelected(pattern);
				}
			};
		};

		//For each pattern.
		for(var patternIndex in patterns) {
			var pattern = patterns[patternIndex];
			
			//Create the canvas for the button and add it to the 
			//toolbar.
			var element = document.createElement("canvas");
			parentElement.appendChild(element);

			element.width = TOOLBAR_CANVAS_WIDTH;
			element.height = TOOLBAR_CANVAS_WIDTH;

			var context = element.getContext("2d");

			//Build the button's image buffer.
			var imageData = context.createImageData(
							TOOLBAR_CANVAS_WIDTH,
							TOOLBAR_CANVAS_WIDTH); 

			//The width of the pattern.
			var patternWidth = pattern[0].length;
			//The height of the pattern.
			var patternHeight = pattern.length;

			//Half the toolbar width, in logical pixels.
			var halfToolbarCellWidth = TOOLBAR_CELL_WIDTH / 2;

			//The logical pixel coordinates corresponding to the top 
			//left corner of the pattern.
			var patternStartX = halfToolbarCellWidth - 
							patternWidth / 2;
			var patternStartY = halfToolbarCellWidth - 
							patternHeight / 2;

			//The width of a logical pixel in proportion to a 
			//canvas pixel.
			var cellWidth = TOOLBAR_CANVAS_WIDTH / 
					TOOLBAR_CELL_WIDTH;

			var roundedCellWidth = Math.round(cellWidth);

			//For each logical pixel in the pattern.
			for(var x = 0; x < patternWidth; x++) {
			for(var y = 0; y < patternHeight; y++) {
				//If it's dead, skip it.
				if(pattern[y][x] === 0) {
					continue;
				}

				//Otherwise find the coordinates of the canvas 
				//pixel corresponding to the top left corner of 
				//this logical pixel.
				var canvasX = mathExt.floor((patternStartX + x) 
							* cellWidth);

				var canvasY = mathExt.floor((patternStartY + y) 
						* cellWidth);

				//Fill the image buffer area covered by the 
				//logical pixel with the colour black.
				for(var innerX = 0; innerX < roundedCellWidth; 
					innerX++ ) {
				for(var innerY = 0; innerY < roundedCellWidth;
					innerY++) {
					var drawnPatternX = innerX + canvasX;
					var drawnPatternY = innerY + canvasY; 

					imageData.data[(drawnPatternX + 
						drawnPatternY * 
						TOOLBAR_CANVAS_WIDTH) *
						ELEMENTS_IN_PIXEL +
						ALPHA_POSITION] = 255;	
				}
				}
			}
			}

			
			//Blit the image buffer to the button's canvas.
			context.putImageData(imageData, 0, 0);

			//Create the click event handler for the toolbar button.
			element.onclick = elementClickFunction(pattern);
		}
	};


	/*
	Builds, draws and manages the game of life scene area.	

	Parameters:
		context - The canvas context in which the scene will be rendered.
		fps - The number of frames per second for the scene drawing loop.
		columns - The number of logical columns in the scene.
		rows - The number of logical rows in the scene.
	*/
	conway.ConwayArea = function (context, fps, columns, rows) {
		var self = this;

		//The logical model of the scene, as 1-dimensional array, each 
		//cell contains either a 1 or a 0. 1 means that the 
		//corresponding logical pixel is alive, 0 means that it's dead.
		//
		//P.S. The reason that the model is a 1-dimensional array is 
		//that it becomes much faster to update later on. We don't have
		//to create that many arrays.
		var liveMatrix = [];
	
		//The total number of elements in the logical model of the 
		//scene.
		var numberOfElements = rows * columns;

		//The number of milliseconds between draw loops.
		var timeout = 1000/fps;

		//Is true if the scene is being animated.
		self.animate = false;

		//Initialise all the logical pixels as dead.
		for (var i = 0; i < numberOfElements; i++) {
			liveMatrix.push(0);
		}

		//When the canvas is clicked.
		context.canvas.onclick = function(evt) {
			//And a click event has been registered with this object.
			if(self.onclick) {
				//Find the location of the click relative to the
				//top left corner of the canvas.
				var event = evt || event;

				var x = event.pageX - context.canvas.offsetLeft;
				var y = event.pageY - context.canvas.offsetTop;
				
				//And pass the coordinates to the registered
				//on click event.
				self.onclick(x, y);
			}
		};

		/*
		Places the conway object with the given [pattern] of 1s and 0s
		on the scene, with its center at the canvas coordinate ([x], [y])
		*/
		self.placePattern = function(pattern, x, y) {
			//Find the logical coordinates of the pattern's center
			//pixel.
			x = mathExt.floor(x * 
				columns / context.canvas.clientWidth);
			y = mathExt.floor(y * 
				rows / context.canvas.clientHeight);

			//The width of the pattern.
			var patternWidth = pattern[0].length;
			//The height of the pattern.
			var patternHeight = pattern.length;

			//Find the top-left corner of the pattern in the 
			//1-dimensional space of the scene's model.
			var startPosition = offsetPosition(x + y*columns,
					-mathExt.intDiv(patternWidth, 2),
					-mathExt.intDiv(patternHeight, 2));

			//For each logical pixel in the pattern.
			for(var patternX = 0; patternX < patternWidth; 
				patternX++) {
			for(var patternY = 0; patternY < patternHeight; 
				patternY++) {

				//If the pixel is turned on.
				if(pattern[patternY][patternX] === 1) {
					//Turn on the corresponding pixel in the
					//model.
					liveMatrix[offsetPosition(
							startPosition,
							patternX,
							patternY
						)] = 1;
				}
			}
			}
		};

		/*
		Performs a single draw/update loop and sets a timeout for the
		next.
		*/
		self.run = function () {
			//If the scene is being animated.
			if(self.animate) {
				//Calculate the next animation.
				liveMatrix = next();
			}

			//Draw the scene.
			draw();

			//Set the timeout for the next update.
			setTimeout(self.run, timeout);
		};

		/*
		Returns the 1-dimensional position of the 1-dimensional position 
		[i] as offset by the 2-dimensional vector ([xOffset], [yOffset]).
		*/
		var offsetPosition = function (i, xOffset, yOffset) {
			var x = (i + xOffset) % columns;
			var y = (mathExt.intDiv(i, columns) + yOffset) % rows;

			if (x < 0) {
				x += columns;
			}

			if (y < 0) {
				y += rows;
			}

			return x + columns * y;
		};

		/*
		Returns the logical model of the next animation frame in the 
		Conway scene.
		*/
		var next = function () {
			//The logical model of the next frame.
			var result = [];

			//For each element in the current logical model.
			for(var i = 0; i < numberOfElements; i++) {
				//Find out how many live neighbours it has.
				//Use the offsetPosition method to transform
				//get the 1D position from the 2D offset of a
				//1D position.
				var liveNeighbours = 0;

				for(var xOffset = -1; xOffset <= 1;
					xOffset++) {

					for(var yOffset = -1; yOffset <= 1; 
						yOffset++) {

						if(xOffset === 0 && 
							yOffset === 0){
							continue;
						}

						var position = offsetPosition(
								i, xOffset,
								yOffset);


						if(liveMatrix[position]) {
							liveNeighbours++;							
						}
					}
				}

				//Use the rules of Conway's game of life to 
				//find out whether this pixel should be dead
				//or alive.
				if(liveNeighbours === 3) {
					result.push(1);
				} else if(liveNeighbours < 2 || 
					liveNeighbours > 3) {
					result.push(0);
				} else {
					result.push(liveMatrix[i]);
				}
			}

			//Return the next iteration.
			return result;
		};

		//Renders the logical model of the scene onto the canvas.
		var draw = function() {
			//The width and height of the canvas.
			var width = context.canvas.width;
			var height = context.canvas.height;

			//The width in pixel elements.
			var widthWithPixels = width * ELEMENTS_IN_PIXEL;

			//The buffer for the rendered scene.
			var imageData = context.createImageData(width, height);

			//For each pixel in the buffer.
			for(var i = 0; i < imageData.data.length; 
						i += ELEMENTS_IN_PIXEL) {

				//Get the x-coordinate.
				var x = i % widthWithPixels;	

				//Get the 2D coordinates of the corresponding
				//logical pixel.
				var newX = mathExt.intDiv(x * columns, 
						widthWithPixels);
				var newY = mathExt.intDiv((i - x) * rows, height * 
						widthWithPixels);

				//Get the 1D coordinate of the logical pixel.
				var elementInLiveMatrix = newX + newY * columns;


				//If the pixel is alive, make the corresponding
				//canvas pixel in the image buffer opaque, 
				//otherwise make it transparent.
				if(liveMatrix[elementInLiveMatrix] === 1) {
					imageData.data[i + ALPHA_POSITION] = 255;
				} else {
					imageData.data[i + ALPHA_POSITION] = 0;
				}
			}

			//Blit the image buffer to the canvas.
			context.putImageData(imageData, 0, 0);
		};
		
	}
})(window.conway = window.conway || {});
