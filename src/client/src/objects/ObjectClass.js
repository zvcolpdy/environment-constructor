import {scene} from '../mainParts/Scene'
import {rotateAroundWorldAxis} from '../helpers/helpers'

THREE.Group.prototype = Object.assign( Object.create( THREE.Group.prototype ), {
    getMaterialColors: function(){
        let arrOfMaterialColors = [];
        this.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                if(Array.isArray(child.material)){
                    for(let i = 0; i < child.material.length; i++){
                        arrOfMaterialColors.push({
                            color: "#" + child.material[i].color.getHexString(),
                            name: child.material[i].name || "—"
                        });
                    }
                }else if(child.material){
                    arrOfMaterialColors.push({
                        color: "#" + child.material.color.getHexString(),
                        name: child.material.name || "—"
                    });
                }
            }
        } );

        return arrOfMaterialColors;
    },

    // delete Object
    deleteObject: function (){
        scene.remove(this);
    },

    //changeScale
    changeScale: function (value) {
        this.scale.set(value, value, value);
        return this.scale;
    },

    //changeRotation
    changeRotation: function (radians) {
        let yAxis = new THREE.Vector3(0,1,0);
        rotateAroundWorldAxis(this, yAxis, radians);
    },

    changeAllColors: function (colors) {
        Object.keys(colors).map((materialId) => {
            this.changeColor(materialId, colors[materialId])
        })
    },

    changeColor: function (index, color) {
        let iterator = 0;
        this.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                if(Array.isArray(child.material)){
                    for(let i = 0; i < child.material.length; i++){
                        if(iterator == index){
                            child.material[i].color.set(color);
                        }
                        iterator++;
                    }
                }else if(child.material){
                    if(iterator == index){
                        child.material.color.set(color);
                    }
                    iterator++;
                }
            }
        } );
    }
} );
