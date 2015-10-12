//=============================================================================
// TDDP_PreloadManager.js
// Version: 0.8.0
//=============================================================================

var Imported = Imported || {};
Imported.TDDP_PreloadManager = "0.8.0";

var TDDP = TDDP || {};
TDDP.PreloadManager = "0.8.0";
//=============================================================================
/*:
 * @plugindesc 0.8.0 Preload resources on scene/map load as well as game boot for a smoother gameplay experience.
 *
 * @author Tor Damian Design / Galenmereth
 *
 * @param Preload System SFX
 * @desc If you want to preload all the SFX specified in the Database System tab on boot, set this to true.
 * @default false
 *
 * @param Print Debug to Console
 * @desc If you want to see debug information in the console (F8) set this to true.
 * @default false
 *
 * @help =~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~
 * Introduction / Table of contents
 * =~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~
 * TDDP PreloadManager lets you preload resources on both boot (before the
 * game title screen displays) and on map load (in between map transfers) to
 * ensure resources such as pictures, music and sound effects are preloaded
 * before called.
 *
 * By default MV will stream the resources as they are required. This plugin
 * serves as an alternative for a smoother gameplay experience at the cost of
 * more bandwidth.
 *
 * This Plugin will load all resources in all event pages on the map,
 * regardless of if they will be triggered by the player at any time or not.
 * Since page conditions cannot be predicted as they are dependent on player
 * interaction, this is a necessity to ensure the right files are ready and
 * preloaded.
 *
 * Table of contents
 * -----------------
 * 1. Installation
 * 2. Advanced Configuration
 * 3. Changelog
 * 4. Terms & Conditions
 * 5. Support
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 1. Installation
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Drag and drop plugin .js file into your project's js/plugins folder, then
 * enable it in the editor interface.
 *
 * Make sure this plugin is placed at the top for maximum compatibility.
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 2. Advanced Configuration
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * There is an advanced configuration section if you open the plugin .js file
 * in a text editor. Look for BOOT PRELOAD CONFIG -- ADVANCED USERS. This lets
 * you define resources to preload on boot manually.
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 3. Changelog
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * • 0.8.0  Initial public release.
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 4. Terms & Conditions
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * http://creativecommons.org/licenses/by/4.0/
 *
 * You are free to:
 * ----------------
 * • Share — copy and redistribute the material in any medium or format
 * • Adapt — remix, transform, and build upon the material
 *
 * for any purpose, even commercially.
 *
 * The licensor cannot revoke these freedoms as long as you follow the license
 * terms.
 *
 * Under the following terms:
 * --------------------------
 * Attribution — You must give appropriate credit, provide a link to the
 * license, and indicate if changes were made. You may do so in any reasonable
 * manner, but not in any way that suggests the licensor endorses you or your
 * use.
 *
 * No additional restrictions — You may not apply legal terms or technological
 * measures that legally restrict others from doing anything the license
 * permits.
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 5. Support
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * You can find me on forums.rpgmakerweb.com with the handle Galenmereth
 *
 * This plugin also has a support topic at the following address:
 * <insert later>
 */
/*
* =============================================================================
* BOOT PRELOAD CONFIG -- ADVANCED USERS
* =============================================================================
*
* Tip: You can omit the filename, it will assume .png since this is what MV
* prefers.
*
* -----------------------------------------------------------------------------
* Image files to load on boot:
* -----------------------------------------------------------------------------
* Keys:
*   animation
*   battleback1
*   battleback2
*   character
*   enemy
*   face
*   parallax
*   picture
*   svActor
*   svEnemy
*   system
*   tileset
*   title1
*   title2
*
* If you have subfolders in any of these folders, just prepend that to the
* filename, like this example, where the picture "arrow" is in the "cursors"
* subfolder within the system folder:
*
* system: [
*   "balloon",
*   "cursors/arrow"
* ]
*/
TDDP.bootPreloadImages = {
    /* Example
    face: [
        "Actor3"
    ],
    system: [
      "myFile",
      "subfolder/myOtherFile"
    ]
    */
    system: [
        "MainMenuContentBG",
        "MainMenuContentSeparator",
        "main_menu/tab",
        // Window_Message
        "window_message/nameplate",
        // Window_Inventory
        "window_inventory/gridSlot",
    ]
}
/*
*
* -----------------------------------------------------------------------------
* BGM files to load on boot
* -----------------------------------------------------------------------------
*/
TDDP.bootPreloadBGM = [
    // "Town1"
]
/*
*
* -----------------------------------------------------------------------------
* BGS files to load on boot
* -----------------------------------------------------------------------------
*/
TDDP.bootPreloadBGS = [
    // "Quake"
]
/*
*
* -----------------------------------------------------------------------------
* SFX files to load on boot.
* -----------------------------------------------------------------------------
*/
TDDP.bootPreloadSE = [
    // "Open2"
]
/*
*
* -----------------------------------------------------------------------------
* ME files to load on boot.
* -----------------------------------------------------------------------------
*/
TDDP.bootPreloadME = [
    // "Open2"
]
//=============================================================================
// END OF BOOT PRELOAD CONFIG
//=============================================================================
var PreloadManager;
(function() {
    //=============================================================================
    // Setting up parameters
    //=============================================================================
    var parameters          = PluginManager.parameters('TDDP_PreloadManager');
    var preloadSystemSFX    = Boolean(parameters['Preload System SFX'] === 'true' || false);
    var debug               = Boolean(parameters['Print Debug to Console'] === 'true' || false);
    if(debug) console.log("========= TDDP PreloadManager: Debug mode on =========")

    PreloadManager = function() {
        throw new Error('This is a static class');
    };

    PreloadManager._callOnComplete = false;
    PreloadManager._filesLoaded = 0;
    PreloadManager._filesTotal = 0;
    PreloadManager._ready = false;
    PreloadManager._preloadedMaps = [];
    PreloadManager._preloadedAudio = [];

    PreloadManager.callOnComplete = function(func) {
        this._callOnComplete = func;
    };

    PreloadManager.start = function() {
        this._ready = true;
        this.controlIfReady(true);
    }

    PreloadManager.preloadImages = function(type, filename, hue) {
        if(filename.constructor === Array) {
            for(var i = 0; i < filename.length; i++) {
                this.preloadImages(type, filename[i], hue);
            }
        } else {
            if(filename.length > 0) {
                if(debug) console.log("Preloading image (" + type + "): ", filename);
                var func = "load" + type.charAt(0).toUpperCase() + type.substr(1).toLowerCase();
                if(typeof ImageManager[func] === 'undefined') {
                    e = "PreloadManager: " + type + " is not a valid image load key. Check your configuration.";
                    Graphics.printError(e);
                    throw new Error(e);
                }
                this._increaseFileNums();
                ImageManager[func](filename, hue)
                    .addLoadListener(this.onFileLoaded.bind(this, filename));
            }
        }
    };

    PreloadManager.preloadBGM = function(audioObject) {
        this.preloadAudio("bgm", audioObject);
    };

    PreloadManager.preloadBGS = function(audioObject) {
        this.preloadAudio("bgs", audioObject);
    };

    PreloadManager.preloadSE = function(audioObject) {
        this.preloadAudio("se", audioObject);
    }

    PreloadManager.preloadME = function(audioObject) {
        this.preloadAudio("me", audioObject);
    }

    PreloadManager.preloadAudio = function(type, audioObject) {
        if(audioObject.constructor === Array) {
            for(var i = 0, max = audioObject.length; i < max; i++) {
                this.preloadAudio(type, audioObject[i]);
            }
        } else {
            if(audioObject.name.length <= 0) return;
            if(this.isAudioCached(type, audioObject.name)) {
                if(debug) console.log(type + "/" + audioObject.name + " already preloaded; skipping.");
                return;
            }
            this._increaseFileNums();
            AudioManager.createBuffer(type, audioObject.name).addLoadListener(this.onFileLoaded.bind(this, audioObject.name));
            this._cacheAudio(type, audioObject.name);
        }
    }

    PreloadManager.preloadAnimation = function(animationId) {
        var animation = $dataAnimations[animationId];
        this.preloadImages('animation', [animation.animation1Name, animation.animation2Name]);
        for(var i=0, max=animation.timings.length; i<max; i++) {
            var se = animation.timings[i].se;
            this.preloadSE(se);
        }
    }

    PreloadManager.preloadMapResources = function(mapId) {
        this._ready = false;
        // Wait and ensure map is loaded
        if(!DataManager.isMapDataLoaded()) return setTimeout(this.preloadMapResources.bind(this, mapId), 250);
        if(this._preloadedMaps.indexOf(mapId) > -1) {
            if(debug) console.log("Map " + mapId + " already preloaded, skipping.");
        } else {
            if(debug) console.log("Map " + mapId + " preload starting.");
            // Map is loaded, preload resources now
            this.preloadBGM($dataMap.bgm);
            this.preloadBGS($dataMap.bgs);
            this.preloadImages('battleback1', $dataMap.battleback1Name);
            this.preloadImages('battleback2', $dataMap.battleback2Name);
            this.preloadImages('parallax', $dataMap.parallaxName);
            // Cycle events and load appropriate resources
            for(var i = 0, max = $dataMap.events.length; i < max; i++) {
                var event = $dataMap.events[i];
                if(!event) continue;
                for(var p = 0, pMax = event.pages.length; p < pMax; p++) {
                    var page = event.pages[p];
                    // Preload character graphic for page
                    this.preloadImages('character', page.image.characterName);
                    for(var l = 0, lMax = page.list.length; l < lMax; l++) {
                        var listEntry = page.list[l];
                        this.preloadEventListEntry(listEntry);
                    }
                }
            };
            this._preloadedMaps.push(mapId);
        }
        this.start(true);
    };

    PreloadManager.preloadEventListEntry = function(listEntry) {
        var code = listEntry.code;
        var parameters = listEntry.parameters;
        switch(code) {
            // Show Picture
            case 231:
                this.preloadImages('picture', parameters[1]);
                break;
            // Play BGM
            case 241:
                this.preloadBGM(parameters[0]);
                break;
            // Play BGS
            case 245:
                this.preloadBGS(parameters[0]);
                break;
            case 249:
                this.preloadME(parameters[0]);
                break;
            // Play SE
            case 250:
                this.preloadSE(parameters[0]);
                break;
            // Change Parallax
            case 284:
                this.preloadImages('parallax', parameters[0]);
                break;
            // Show Text
            case 101:
                this.preloadImages('face', parameters[0]);
                break;
            // Show Animation
            case 212:
                this.preloadAnimation(parameters[1]);
                break;
        }
    }

    PreloadManager.onFileLoaded = function(filename) {
        this._filesLoaded += 1;
        if(debug) console.log("Loaded file: " + filename + "(" + this._filesLoaded + "/" + this._filesTotal + ")");
        this.controlIfReady();
    };

    PreloadManager.controlIfReady = function(manual) {
        if(this.isReady()) {
            if(debug && !manual) console.log("All files loaded (" + this._filesLoaded + "/" + this._filesTotal + ")");
            this._filesTotal = this._filesLoaded = 0;
            if(this._callOnComplete) {
                this._callOnComplete.call();
            }
        }
    }

    PreloadManager._cacheAudio = function(path, filename) {
        this._preloadedAudio.push(path + filename);
    }

    PreloadManager.isAudioCached = function(path, filename) {
        return this._preloadedAudio.indexOf(path + filename) > -1;
    }

    PreloadManager._increaseFileNums = function() {
        this._ready = false;
        this._filesTotal +=1;
    };

    PreloadManager.isReady = function() {
        if(this._filesLoaded >= this._filesTotal) {
            if(this._ready || this._filesTotal == 0) {
                return true;
            }
        }
        return false;
    }


    //=============================================================================
    // Scene_Boot extensions
    //=============================================================================
    var Scene_Boot_prototype_create =
        Scene_Boot.prototype.create;
    Scene_Boot.prototype.create = function() {
        Scene_Boot_prototype_create.call(this);
        this._performPreload();
    };

    Scene_Boot.prototype._performPreload = function() {
        if(!DataManager.isDatabaseLoaded()) return setTimeout(this._performPreload.bind(this), 5);
        if(debug) console.log("========= TDDP PreloadManager: Boot Preload =========");
        // Preload bootPreloadImages resources
        if(TDDP.bootPreloadImages) {
            for(var key in TDDP.bootPreloadImages) {
                if(TDDP.bootPreloadImages.hasOwnProperty(key)) {
                    PreloadManager.preloadImages(key, TDDP.bootPreloadImages[key]);
                }
            }
        }
        // Preload bootPreloadBGM resources
        if(TDDP.bootPreloadBGM && TDDP.bootPreloadBGM.length > 0) {
            for(var i = 0, max = TDDP.bootPreloadBGM.length; i < max; i++) {
                PreloadManager.preloadBGM({
                    name: TDDP.bootPreloadBGM[i],
                    volume: 90,
                    pitch: 100
                });
            }
        }
        // Preload bootPreloadBGS resources
        if(TDDP.bootPreloadBGS && TDDP.bootPreloadBGS.length > 0) {
            for(var i = 0, max = TDDP.bootPreloadBGS.length; i < max; i++) {
                PreloadManager.preloadBGS({
                    name: TDDP.bootPreloadBGS[i],
                    volume: 90,
                    pitch: 100
                });
            }
        }
        // Preload bootPreloadSE resources
        if(TDDP.bootPreloadSE && TDDP.bootPreloadSE.length > 0) {
            for(var i = 0, max = TDDP.bootPreloadSE.length; i < max; i++) {
                PreloadManager.preloadSE({
                    name: TDDP.bootPreloadSE[i],
                    volume: 90,
                    pitch: 100
                });
            }
        }
        // Preload bootPreloadME resources
        if(TDDP.bootPreloadME && TDDP.bootPreloadME.length > 0) {
            for(var i = 0, max = TDDP.bootPreloadME.length; i < max; i++) {
                PreloadManager.preloadME({
                    name: TDDP.bootPreloadME[i],
                    volume: 90,
                    pitch: 100
                });
            }
        }
        // Preload system SFX if set
        if(preloadSystemSFX) {
            "========= TDDP PreloadManager: Boot Preloading System SFX ========="
            for(var i = 0, max = $dataSystem.sounds.length; i < max; i++) {
                PreloadManager.preloadSE($dataSystem.sounds[i]);
            }
        }
        PreloadManager.start();
    };

    //=============================================================================
    // DataManager extensions
    //=============================================================================
    var DataManager_loadMapData =
        DataManager.loadMapData;
    DataManager.loadMapData = function(mapId) {
        if(debug) console.log("========= TDDP PreloadManager: Map Preload =========");
        this._preloaded = false;
        DataManager_loadMapData.call(this, mapId);
        PreloadManager.preloadMapResources(mapId);
        PreloadManager.callOnComplete(this._onPreloadDone.bind(this));
    }

    DataManager._onPreloadDone = function() {
        this._preloaded = true;
    }

    var DataManager_isMapLoaded =
        DataManager.isMapLoaded;
    DataManager.isMapLoaded = function() {
        return (this.isMapDataLoaded() && this._preloaded);
    }

    DataManager.isMapDataLoaded = function() {
        return DataManager_isMapLoaded.call(this);
    }

    //=============================================================================
    // Scene_Base extensions
    //=============================================================================
    var Scene_Base_prototype_isReady =
        Scene_Base.prototype.isReady;
    Scene_Base.prototype.isReady = function() {
        if(!PreloadManager.isReady()) return false;
        return Scene_Base_prototype_isReady.call(this);
    }
})();
