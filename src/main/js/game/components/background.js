define(require => {
    const resLib = require('skbJet/component/resourceLoader/resourceLib');
    const displayList = require('skbJet/componentManchester/standardIW/displayList');
    const PIXI = require('com/pixijs/pixi');
    const orientation = require('skbJet/componentManchester/standardIW/orientation');
    const msgBus = require('skbJet/component/gameMsgBus/GameMsgBus');
    const Text = require('skbJet/componentManchester/standardIW/components/fittedText');

    let background;

    require('com/gsap/TweenMax');
    const Tween = window.TweenMax;

    let effectsArray = [];

    function init() {
        background = new PIXI.spine.Spine(resLib.spine['panelSpine'].spineData);
        background.state.setAnimation(0, "idleLoop", true);
        background.state.timeScale = 0.5;

        displayList.animatedBackground.addChild(background);

        setupHowToPlayTitleEffects(displayList.howToPlayPage2Title);
        setupHowToPlayTitleEffects(displayList.howToPlayPage3Title);
        setupHowToPlayTitleEffects(displayList.bonusGameTitle);
        setupHowToPlayTitleEffects(displayList.wheelGameTitle);

        // winPlaque = new PIXI.spine.Spine(resLib.spine['MM_MasterPopUps'].spineData);
        // displayList.winPlaqueBG.addChild(winPlaque);

        // onOrientationChange();
        //
        // losePlaque = '';
        // displayList.losePlaqueBG.addChild(losePlaque);
        msgBus.subscribe('GameSize.OrientationChange', onOrientationChange);

        displayList.backgroundOverlay.blendMode = PIXI.BLEND_MODES.ADD;
        displayList.wheelGlow.blendMode = PIXI.BLEND_MODES.ADD;
        displayList.wheelTitleGlow.blendMode = PIXI.BLEND_MODES.ADD;
        displayList.bonusTitleGlow.blendMode = PIXI.BLEND_MODES.ADD;

        background.state.addListener({
            complete: (entry) => {
                if (entry.animation.name === "pattern01Intro") {
                    background.state.setAnimation(0, "pattern01Loop", false);
                }
                if (entry.animation.name === "pattern01Loop") {
                    background.state.setAnimation(0, "pattern01Outro", false);
                }
                if (entry.animation.name === "pattern01Outro") {
                    background.state.setAnimation(0, "idleLoopSubtle", true);
                }
            }
        });

        onOrientationChange();

        displayList.resultPlaquesContainer.interactive = false;
        displayList.winPlaqueBG.parent.interactive = false;
        displayList.losePlaqueBG.parent.interactive = false;

    }

    function onOrientationChange() {
        displayList.winPlaqueCloseButton.hitArea = orientation.get() === orientation.LANDSCAPE ? new PIXI.Rectangle(-720, -405, 810, 900) : new PIXI.Rectangle(-410, -650, 810, 920);
        displayList.losePlaqueCloseButton.hitArea = orientation.get() === orientation.LANDSCAPE ? new PIXI.Rectangle(-720, -405, 810, 900) : new PIXI.Rectangle(-410, -650, 810, 920);
        displayList.resultPlaqueOverlay.hitArea = orientation.get() === orientation.LANDSCAPE ? new PIXI.Rectangle(-720, -405, 810, 900) : new PIXI.Rectangle(-410, -650, 810, 920);

        effectsArray.forEach(e=>{
            e.parent.removeChild(e.field);
        });

        effectsArray = [];

        setupHowToPlayTitleEffects(displayList.howToPlayPage2Title);
        setupHowToPlayTitleEffects(displayList.howToPlayPage3Title);
        setupHowToPlayTitleEffects(displayList.bonusGameTitle);
        setupHowToPlayTitleEffects(displayList.wheelGameTitle);

    }

    function inGame() {
        background.state.setAnimation(0, "pattern01Intro", false);
    }

    function intro() {
        background.state.setAnimation(0, "idleLoopSubtle", true);

    }

    function bonus() {
        background.state.setAnimation(0, "idleLoop", true);
    }

    function showWin() {
        background.state.setAnimation(0, "regularWinLoop", true);
    }

    function showBigWin() {
        background.state.setAnimation(0, "bigWin Loop", true);
    }

    function setupHowToPlayTitleEffects(target) {
        for (let i = 0; i < 3; i++) {
            if (i > 0) {

                let text = new Text(target.text);
                text.style = target.style;
                text.y = target.y - (10 * i);
                text.x = target.x;
                text.anchor.set(0.5);
                text.scale.set(target.scale.x + ((i + 1) / 10));
                text.alpha = (0.5 - ((i + 1) / 10));
                text.maxWidth = target.maxWidth + (10 * i);
                effectsArray.push({parent: target.parent, field: text});
                target.parent.addChildAt(text, 0);

                Tween.to(text,5,{
                    alpha: 0,
                    repeat: -1,
                    yoyo:true
                });
            }
        }
    }

    return {
        init,
        intro,
        showWin,
        showBigWin,
        inGame,
        bonus,
    };

});
