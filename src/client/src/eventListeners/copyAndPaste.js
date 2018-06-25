import {updateStateFn} from '../state'
import {eventEmitterConstants} from '../constants/eventEmiterConstants'
import { guid } from "../helpers/helpers"
import state from '../state'

document.body.addEventListener("keydown",function(e){
    e = e || window.event;
    var key = e.which || e.keyCode; // keyCode detection
    var ctrl = e.ctrlKey ? e.ctrlKey : ((key === 17) ? true : false); // ctrl detection

    if ( key == 86 && ctrl ) {
        (function () {
            updateStateFn({
                type: eventEmitterConstants.PASTE_MODEL,
                copyBufferObjectId: state.copyBufferObjectId,
                newId: guid()
            });
        })()
    } else if ( key == 67 && ctrl ) {
        updateStateFn({
            type: eventEmitterConstants.COPY_MODEL
        });
    }

},false);