
/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('./post-css/screen.css');

var io = require('socket.io-client')('/screens');
var remotes = null;
var remoteCount = 0;
var rAF = require('raf');
var drawing = false;
var rAFIndex = null;

var width = document.body.offsetWidth;
var height = document.body.offsetHeight;

// Show what address to connect the phone to:
var addressDisplay = document.getElementById('address');

io.once('initialize', firstConnected)
  .on('push', remoteJoined)
  .on('pop', remoteLeaving)

  // Use the phone's gyro data to update the position of the cursor.
  .on('position', function(id, position) {
    if (!remotes) return;
    remotes[id] = remotes[id] || {};
    remotes[id].x = position[0];
    remotes[id].y = position[1];
    requestUpdate();
  });

// Initialize any cursors that that already joined.
function firstConnected({remoteIDs=[],address=''}) {
  addressDisplay.innerHTML = `http://${address}`;
  remotes = {};
  for (var i = 0; i < remoteIDs.length; i++) {
    remoteJoined(remoteIDs[i]);
  }
}

// A remote has joined.
function remoteJoined(id) {
  if (!remotes) return;
  if (!remotes[id]) {
    remoteCount++;
    remotes[id] = {
      x: 0,
      y: 0
    };
    remotes[id].dom = makeCursor();
  }
}

// A remote has left.
function remoteLeaving(id) {
  if (!remotes) return;
  if (remotes[id].dom) remotes[id].dom.parentNode.removeChild(remotes[id].dom);
  remoteCount -= delete remotes[id];
}

function requestUpdate() {
  if (!drawing) {
    drawing = true;
    rAFIndex = rAF(updateDisplay);
  }
}

// Show cursors on the screen.
function updateDisplay() {
  for (var p in remotes) {
    var cursor = remotes[p];
    var x = cursor.x * (width * .5);
    var y = cursor.y * (height * .5);
    var trans = `translate3d(${x}px,${y}px,0)`;
    cursor.dom.style.webkitTransform = cursor.dom.style.transform = trans;
    if (x > 0 && x < 300) {
      createParticle( event );
    }
    console.log('touching my screen');
  }

  drawing = false;
}

// Generates a cursor DOM object.
var makeCursor = function() {
  var cursor = document.createElement('i');
  cursor.classList.add('cursor');
  document.body.appendChild(cursor);
  return cursor;
};

var d = document, $d = $(d),
    w = window, $w = $(w),
    wWidth = $w.width(), wHeight = $w.height(),
    credit = $('.credit > a'),
    particles = $('.particles'),
    particleCount = 0,
    sizes = [
      15, 20, 25, 35, 45
    ],
    colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
      '#FF5722', '#795548', '#9E9E9E', '#607D8B', '#777777'
    ],

    mouseX = $w.width() / 2, mouseY = $w.height() / 2;

function updateParticleCount () {
  $('.particle-count > .number').text(particleCount);
};

$w
.on( 'resize' , function () {
  wWidth = $w.width();
  wHeight = $w.height();
});

$d
.on( 'mousemove touchmove' , function ( event ) {
  event.preventDefault();
  event.stopPropagation();
  mouseX = event.clientX;
  mouseY = event.clientY;
  if( !!event.originalEvent.touches ) {
    mouseX = event.originalEvent.touches[0].clientX;
    mouseY = event.originalEvent.touches[0].clientY;
  }
})
.on( 'mousedown touchstart' , function( event ) {
  if( event.target === credit.get(0) ){
    return;
  }
  mouseX = event.clientX;
  mouseY = event.clientY;
  if( !!event.originalEvent.touches ) {
    mouseX = event.originalEvent.touches[0].clientX;
    mouseY = event.originalEvent.touches[0].clientY;
  }
  var timer = setInterval(function () {
    $d
    .one('mouseup mouseleave touchend touchcancel touchleave', function () {
      clearInterval( timer );
    })
    createParticle( event );
  }, 1000 / 60)

});


function createParticle ( event ) {
  var particle = $('<div class="particle"/>'),
      size = sizes[Math.floor(Math.random() * sizes.length)],
      color = colors[Math.floor(Math.random() * colors.length)],
      negative = size/2,
      speedHorz = Math.random() * 10,
      speedUp = Math.random() * 25,
      spinVal = 360 * Math.random(),
      spinSpeed = ((36 * Math.random())) * (Math.random() <=.5 ? -1 : 1),
      otime,
      time = otime = (1 + (.5 * Math.random())) * 1000,
      top = (mouseY - negative),
      left = (mouseX - negative),
      direction = Math.random() <=.5 ? -1 : 1 ,
      life = 10;

  particle
  .css({
    height: size + 'px',
    width: size + 'px',
    top: top + 'px',
    left: left + 'px',
    background: color,
    transform: 'rotate(' + spinVal + 'deg)',
    webkitTransform: 'rotate(' + spinVal + 'deg)'
  })
  .appendTo( particles );
  particleCount++;
  updateParticleCount();

  var particleTimer = setInterval(function () {
    time = time - life;
    left = left - (speedHorz * direction);
    top = top - speedUp;
    speedUp = Math.min(size, speedUp - 1);
    spinVal = spinVal + spinSpeed;


    particle
    .css({
      height: size + 'px',
      width: size + 'px',
      top: top + 'px',
      left: left + 'px',
      opacity: ((time / otime)/2) + .25,
    	transform: 'rotate(' + spinVal + 'deg)',
    	webkitTransform: 'rotate(' + spinVal + 'deg)'
    });

    if( time <= 0 || left <= -size || left >= wWidth + size || top >= wHeight + size ) {
      particle.remove();
  		particleCount--;
      updateParticleCount();
      clearInterval(particleTimer);
    }
  }, 1000 / 50);
}
