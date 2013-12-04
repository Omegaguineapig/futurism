angular.module('futurism')
	.factory('socket', ['session', function(session) {
		'use strict';

		var socket = io.connect('http://localhost:9000');
		var buffer = [];
		var ready = false;

		var flushBuffer = function() {
			for(var i=0; i<buffer.length; i++) {
				var event = buffer[i];
				console.log('flush emit', event.eventName, event.data);
				socket.emit(event.eventName, event.data);
			}
			buffer = [];
		};

		var sendAuth = function() {
			console.log('sendAuth', session.getToken());
			socket.emit('auth', {token: session.getToken()});
		};

		socket.on('disconnect',function() {
			ready = false;
		});

		socket.on('connect', function() {
			ready = false;
		});

		socket.on('auth', function (data) {
			sendAuth();
		});

		socket.on('authFail', function(data) {
			console.log('authFail', data);
			_.delay(sendAuth, 3000);
		});

		socket.on('ready', function(data) {
			console.log('rec ready');
			ready = true;
			flushBuffer();
		});

		socket.authEmit = function(eventName, data) {
			if(ready) {
				console.log('emit', eventName, data);
				socket.emit(eventName, data);
			}
			else {
				buffer.push({eventName:eventName, data:data});
			}
		};

		return socket;

	}]);