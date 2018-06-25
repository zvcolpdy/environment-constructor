THREE.DragControls = function ( _objects, _camera, _domElement ) {

    if ( _objects instanceof THREE.Camera ) {

        console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
        var temp = _objects; _objects = _camera; _camera = temp;

    }

    var _plane = new THREE.Plane();
    console.log(new THREE.Raycaster())
    var _raycaster = new THREE.Raycaster();

    var _mouse = new THREE.Vector2();
    var _offset = new THREE.Vector3();
    var _intersection = new THREE.Vector3();
    var _selected = null, _hovered = null;
    var _isShiftDown = false;
    var _isCtrlDown = false;
    //

    var scope = this;

    function activate() {

        _domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
        _domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
        _domElement.addEventListener( 'mouseup', onDocumentMouseCancel, false );
        _domElement.addEventListener( 'mouseleave', onDocumentMouseCancel, false );
        _domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );
        _domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
        _domElement.addEventListener( 'touchend', onDocumentTouchEnd, false );
        document.addEventListener( 'keydown', onDocumentKeyDown, false );
        document.addEventListener( 'keyup', onDocumentKeyUp, false );
        _domElement.addEventListener("dblclick", onDoubleClick);

    }

    function deactivate() {

        _domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
        _domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
        _domElement.removeEventListener( 'mouseup', onDocumentMouseCancel, false );
        _domElement.removeEventListener( 'mouseleave', onDocumentMouseCancel, false );
        _domElement.removeEventListener( 'touchmove', onDocumentTouchMove, false );
        _domElement.removeEventListener( 'touchstart', onDocumentTouchStart, false );
        _domElement.removeEventListener( 'touchend', onDocumentTouchEnd, false );
        document.removeEventListener( 'keydown', onDocumentKeyDown, false );
        document.removeEventListener( 'keyup', onDocumentKeyUp, false );
        _domElement.removeEventListener("dblclick", onDoubleClick);
    }
    
    function getParentGroup(object) {
        let lastGroup;
        
        const getParent = function(object){
            if(object.parent instanceof THREE.Group){
                lastGroup = object.parent;
                getParent(object.parent);
            }
        };
        getParent(object);
        
        return lastGroup
    }

    function dispose() {

        deactivate();

    }

    function onDocumentKeyDown( event ) {
        switch( event.keyCode ) {
            case 16: _isShiftDown = true; break;
            case 17: _isCtrlDown = true; break;
        }
    }

    function onDocumentKeyUp( event ) {
        switch ( event.keyCode ) {
            case 16: _isShiftDown = false; break;
            case 17: _isCtrlDown = false; break;
        }
    }

    function onDoubleClick( event ) {
        event.preventDefault();

        _raycaster.setFromCamera( _mouse, _camera );

        var intersects = _raycaster.intersectObjects( _objects, true );

        if ( intersects.length > 0 ) {

            scope.dispatchEvent( { type: 'dblclick', object: getParentGroup(intersects[ 0 ].object) } );

        }else{
            scope.dispatchEvent( { type: 'dblclick', object: null } );
        }
    }

    function onDocumentMouseMove( event ) {

        event.preventDefault();

        var rect = _domElement.getBoundingClientRect();

        _mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
        _mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

        _raycaster.setFromCamera( _mouse, _camera );

        if ( _selected && scope.enabled ) {

            if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {
                // _selected.position.copy( _intersection.sub( _offset ) );
            }

            scope.dispatchEvent( {
                type: 'drag',
                _id: _selected._id,
                position: {..._intersection.sub( _offset )},
            } );

            return;

        }

        _raycaster.setFromCamera( _mouse, _camera );

        var intersects = _raycaster.intersectObjects( _objects, true );

        if ( intersects.length > 0 ) {

            var object = getParentGroup(intersects[ 0 ].object);

            // _plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), object.position );
            _plane.setFromNormalAndCoplanarPoint( new THREE.Vector3(0, 1, 0), object.position );

            if ( _hovered !== object ) {

                scope.dispatchEvent( { type: 'hoveron', object: object } );

                _domElement.style.cursor = 'pointer';
                _hovered = object;

            }

        } else {
            if ( _hovered !== null ) {

                scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

                _domElement.style.cursor = 'auto';
                _hovered = null;

            }

        }

    }

    function onDocumentMouseDown( event ) {

        event.preventDefault();

        _raycaster.setFromCamera( _mouse, _camera );

        var intersects = _raycaster.intersectObjects( _objects, true );

        if ( intersects.length > 0 ) {

            if( _isShiftDown ) {

                scope.dispatchEvent( { type: 'deleteObject', _id: getParentGroup(intersects[ 0 ].object)._id } );

                return;
            }

            if( _isCtrlDown ) {

                scope.dispatchEvent( { type: 'shiftSelect', _id: getParentGroup(intersects[ 0 ].object)._id } );

                return;
            }

            _selected = getParentGroup(intersects[ 0 ].object);

            if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {
                _offset.copy( _intersection ).sub( _selected.position );
            }

            _domElement.style.cursor = 'move';

            scope.dispatchEvent( { type: 'dragstart', object: _selected } );

        }

    }

    function onDocumentMouseCancel( event ) {

        event.preventDefault();

        if ( _selected ) {

            scope.dispatchEvent( { type: 'dragend', object: _selected } );

            _selected = null;

        }

        _domElement.style.cursor = 'auto';

    }

    function onDocumentTouchMove( event ) {

        event.preventDefault();
        event = event.changedTouches[ 0 ];

        var rect = _domElement.getBoundingClientRect();

        _mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
        _mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

        _raycaster.setFromCamera( _mouse, _camera );

        if ( _selected && scope.enabled ) {

            if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

                _selected.position.copy( _intersection.sub( _offset ) );

            }

            scope.dispatchEvent( { type: 'drag', object: _selected } );

            return;

        }

    }

    function onDocumentTouchStart( event ) {

        event.preventDefault();
        event = event.changedTouches[ 0 ];

        var rect = _domElement.getBoundingClientRect();

        _mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
        _mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

        _raycaster.setFromCamera( _mouse, _camera );

        var intersects = _raycaster.intersectObjects( _objects );

        if ( intersects.length > 0 ) {

            _selected = intersects[ 0 ].object;

            _plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _selected.position );

            if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

                _offset.copy( _intersection ).sub( _selected.position );

            }

            _domElement.style.cursor = 'move';

            scope.dispatchEvent( { type: 'dragstart', object: _selected } );

        }


    }

    function onDocumentTouchEnd( event ) {

        event.preventDefault();

        if ( _selected ) {

            scope.dispatchEvent( { type: 'dragend', object: _selected } );

            _selected = null;

        }

        _domElement.style.cursor = 'auto';

    }

    activate();

    // API

    this.enabled = true;

    this.activate = activate;
    this.deactivate = deactivate;
    this.dispose = dispose;

    // Backward compatibility

    this.setObjects = function () {

        console.error( 'THREE.DragControls: setObjects() has been removed.' );

    };

    this.on = function ( type, listener ) {

        console.warn( 'THREE.DragControls: on() has been deprecated. Use addEventListener() instead.' );
        scope.addEventListener( type, listener );

    };

    this.off = function ( type, listener ) {

        console.warn( 'THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.' );
        scope.removeEventListener( type, listener );

    };

    this.notify = function ( type ) {

        console.error( 'THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.' );
        scope.dispatchEvent( { type: type } );

    };

};

THREE.DragControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.DragControls.prototype.constructor = THREE.DragControls;