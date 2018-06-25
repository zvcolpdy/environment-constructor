import {updateStateFn} from '../state'
import {guid} from "../helpers/helpers"
import {eventEmitterConstants} from '../constants/eventEmiterConstants'
import {saveScene, loadScene} from "../helpers/save"
import {modelsData, textures} from "../data"

let gui = new dat.GUI({
    autoPlace: true,
});

/* BEGIN: add models to scene */

let obj = { 'Add Models': function(){ addModelsModalWindow.openModal() }};
gui.add(obj,'Add Models');

/* END: add models to scene */

/* BEGIN: change plane texture */

let changePlaneTexturesFolder = gui.addFolder('Plane textures');

let textureData = textures.map((v) => ({
    ...v,
    [v.name]: () => {
        updateStateFn({
            type: eventEmitterConstants.CHANGE_PLANE_TEXTURE,
            src: v.src
        });
    }
}));

for(let i = 0; i < textureData.length; i++){
    changePlaneTexturesFolder.add(textureData[i], textureData[i].name)
}

/* END: change plane texture */

/* BEGIN: change selected object params */

let selectedObjectFolder = null;

function updateMenu(payload){

    switch(payload.type){

        case "UNSET_SELECTED_OBJECT": {
            gui.removeFolder(selectedObjectFolder);
            selectedObjectFolder = null;
            break;
        }

        case "SET_SELECTED_OBJECT": {

            let {objectScheme, object} = payload;

            if(selectedObjectFolder){
                gui.removeFolder(selectedObjectFolder)
                selectedObjectFolder = null;
            }

            selectedObjectFolder = gui.addFolder('Selected object');

            let rotation = {rotation: objectScheme.rotation};
            selectedObjectFolder.add(rotation, 'rotation', 0, 2*Math.PI, 0.01).onChange(function (radians) {
                updateStateFn({
                    type: eventEmitterConstants.ROTATE_OBJECT,
                    _id: objectScheme._id,
                    radians
                })
            });

            let scale = {scale: objectScheme.scale};
            selectedObjectFolder.add(scale, 'scale', 0.01, 20, 0.001).onChange(function (value) {
                updateStateFn({
                    type: eventEmitterConstants.SCALE_OBJECT,
                    _id: objectScheme._id,
                    scale: value
                })
            });

            let colorsFromObject = object.getMaterialColors();
            colorsFromObject.map((material, index) => {
                let colorFromObjectScheme = objectScheme.arrOfMaterialColors[index];
                let color = {[material.name]: colorFromObjectScheme ? colorFromObjectScheme : material.color};
                selectedObjectFolder.addColor(color, material.name).onChange(function (value) {
                    updateStateFn({
                        type: eventEmitterConstants.CHANGE_MATERIAL_COLOR,
                        _id: objectScheme._id,
                        color: {
                            index: index,
                            value: value,
                        }
                    })
                });
            });

            selectedObjectFolder.open();

            break;

        }

    }
}

/* END: change selected object params */

/* BEGIN: add models modal window */

var addModelsModalWindow = (function () {
    var $modalWindow = $(".add-models"),
        $tabsNav = $modalWindow.find(".tabs .head"),
        $tabsMain = $modalWindow.find(".tabs .main"),
        $input = $("#fileinput1"),
        $uploadBtn = $(".add-models .upload-btn");

    function closeModal() {
        $modalWindow.toggleClass("visible");
    }

    function openModal() {
        $modalWindow.toggleClass("visible");
    }

    function init(){
        Object.keys(modelsData).map(tabName => {
            $tabsNav.prepend('<div class="btn">'+tabName+'</div>');

            var $models = modelsData[tabName].map(item => '<div class="item" data-src="'+ item.src +'">\n' +
                '<div class="img-wr" style="background-image: url(' + item.srcImg + ')"></div>\n' +
                '<h4>' + item.name + '</h4>\n' +
                '</div>');
            $tabsMain.prepend('<div>'+$models.join("")+'</div>')
        })
        $tabsMain.find("> div").eq(0).addClass("visible");
        $tabsNav.find(".btn").eq(0).addClass("active");
    }
    init();

    $tabsNav.delegate(".btn", "click", function () {
        let index = $(this).index();
        let $tabs = $tabsMain.find("> div");

        $tabsNav.find(".btn").removeClass("active");
        $tabs.removeClass("visible")

        $(this).addClass("active");
        $tabs.eq(index).addClass("visible")
    });

    $tabsMain.delegate(".item", "click", function () {
        updateStateFn({
            type: eventEmitterConstants.ADD_OBJECT_DATA,
            _id: guid(),
            src: $(this).data("src")
        })
        closeModal();
    });

    $uploadBtn.click(function () {
        $input.click();
    });
    $input.change(function (e) {
        setTimeout(function () {
            $(".fake-item").css({"display": "block"});
        }, 300)
    });

    $(document).keyup(function(e) {
        if (e.keyCode === 27) closeModal();
    });

    $(".exit").click(closeModal)

    return{
        openModal: openModal
    }

})();

/* END: add models modal window */

/* BEGIN: export/import */

let addEditFolder = gui.addFolder('Edit');

let options = {
    "save": saveScene,
    "load": loadScene
};

addEditFolder.add(options, 'save');
addEditFolder.add(options, 'load');

/* END: export/import */

export {
    updateMenu
}