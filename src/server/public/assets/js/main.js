function fetchWrapper(type, body, url, callback){
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");

    var myInit = {
        method: type,
        headers: myHeaders,
        credentials: 'same-origin',
        body: JSON.stringify(body)
    };

    var myRequest = new Request(url, myInit);

    return fetch(myRequest).then(function(response) {
        response.json().then(callback);
    })
}

$(document).ready(function() {

    var profileModule = (function () {
        var sceneItemTemplate = '<li data-id="{{_id}}"><h4>{{name}}</h4><div class="right"><div class="btn edit">Edit</div><div class="btn delete">Delete</div><a href="{{link}}" class="btn">Go to scene</a></div></li>',
            sceneLinksTemplate = '<li data-id="{{linkUrl}}"><div><h5>Link:</h5><span>{{link}}</span></div><div><div class="fl-wr"><h5>Type:</h5><span>{{type}}</span></div><div class="btn delete">Delete</div></div></li>';

            // scene DOM
        var $sceneList = $(".scenes-list ul"),
            $addSceneBtn = $(".scenes-list .add-scene"),
            $inputNameScene = $(".scenes-list .fl-wr input"),
            // modals DOM
            $modalSceneEdit = $(".modal.scene-edit"),
            $renameSceneInput = $modalSceneEdit.find(".change-name input"),
            $changeSceneNameBtn = $modalSceneEdit.find(".change-name .btn"),
            $namSceneTitle = $modalSceneEdit.find("h3 span"),
            $generateLinkBtn =  $modalSceneEdit.find(".btn.generate-link"),
            $generateLinkModeType =  $modalSceneEdit.find("select"),
            $linksList = $modalSceneEdit.find("ul");


        var editedSceneId = null,
            state = null;

        //refactor
        $addSceneBtn.click(createScene);
        $sceneList.on('click', '.btn.delete', function () {
            deleteScene($(this).parents("li").data("id"));
        });
        $sceneList.on('click', '.btn.edit', function () {
            openModal($(this).parents("li").data("id"));
        });
        $linksList.on('click', '.btn.delete', function () {
            deleteLink($(this).parents("li").data("id"));
        });
        $changeSceneNameBtn.click( function () {
            var sceneName = $renameSceneInput.val();
            if(sceneName.length < 4){
                alert("Enter scene name. Min length - 4 symbols.")
            }else{
                editScene({
                    _id: editedSceneId,
                    name: sceneName
                });
            }
        });
        $generateLinkBtn.click( function () {
            var modeType = $generateLinkModeType.val();
            if(modeType !== '0'){
                $generateLinkModeType.val("0");
                generateLink(modeType);
            }else{
                alert("Select mode type.")
            }
        });
        $(document).keyup(function(e) {
            if (e.keyCode === 27) closeModal();
        });

        $(".exit").click(closeModal)


        /* BEGIN: DOM MANIPULATION */

        function openModal(id) {
            editedSceneId = id;
            initModal();
            $modalSceneEdit.addClass("visible");
        }

        function closeModal() {
            editedSceneId = null;
            $modalSceneEdit.removeClass("visible");
        }

        function initModal() {
            $namSceneTitle.html(state[editedSceneId].name);
            $renameSceneInput.val(state[editedSceneId].name);

            var list = state[editedSceneId].links.map(val => {
                var newLinksList = sceneLinksTemplate;
                newLinksList = newLinksList.replace("{{link}}", "localhost:3000/scene/" + editedSceneId + '/' + val.linkUrl);
                newLinksList = newLinksList.replace("{{type}}", val.type === "1" ? "Demonstrate mode" : "Edit mode");
                newLinksList = newLinksList.replace("{{linkUrl}}", val.linkUrl);
                return newLinksList;
            });
            $linksList.html(list)
        }

        function addScene(scene) {
            var newSceneItem = sceneItemTemplate;
            newSceneItem = newSceneItem.replace("{{name}}", scene.name);
            newSceneItem = newSceneItem.replace("{{_id}}", scene._id);
            newSceneItem = newSceneItem.replace("{{link}}", "scene/" + scene._id);
            $sceneList.append(newSceneItem);
        }

        function addArrayOfScenes(arr) {
            $sceneList.html("");
            arr.map(addScene)
        }

        function deleteSceneById(id) {
            $("[data-id="+ id +"]").remove();
        }

        /* END: DOM MANIPULATION */

        /* BEGIN: API REQUESTS */

        function createScene() {
            var sceneName = $inputNameScene.val();
            if(sceneName.length < 4){
                alert("Enter scene name. Min length - 4 symbols.")
            }else{
                fetchWrapper('POST', {name: sceneName}, 'api/scenes/create', (scene) => {
                    addScene(scene);
                    state[scene._id] = scene;
                    $inputNameScene.val('')
                })
            }
        }

        function deleteScene(id) {
            fetchWrapper('POST', {_id: id}, 'api/scenes/delete', () => {
                delete state[id];
                deleteSceneById(id);
            })
        }

        function fetchScenes() {
            fetchWrapper('POST', {}, 'api/scenes', (scenes) => {
                state = scenes.reduce((init, val) => {
                    init[val._id] = val;
                    return init
                }, {});
                addArrayOfScenes(scenes);
            })
        }

        function editScene(scene) {
            fetchWrapper('POST', scene, 'api/scenes/edit', (scene) => {
                state[scene._id] = scene;
                initModal();
                addArrayOfScenes(Object.keys(state).map(id => state[id]));
            })
        }

        function generateLink(type) {
            fetchWrapper('POST', {type: type, _id: editedSceneId}, 'api/scenes/generate_link', (scene) => {
                state[scene._id] = scene;
                initModal();
                addArrayOfScenes(Object.keys(state).map(id => state[id]));
            })
        }
        function deleteLink(id) {
            fetchWrapper('POST', {link_id: id, _id: editedSceneId}, 'api/scenes/delete_link', (scene) => {
                state[scene._id] = scene;
                initModal();
                addArrayOfScenes(Object.keys(state).map(id => state[id]));
            })
        }

        // check for profile page
        fetchScenes();

        /* END: API REQUESTS */

    })();

});