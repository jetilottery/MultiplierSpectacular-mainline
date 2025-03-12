define(require => {
    const Pressable = require('skbJet/componentManchester/standardIW/components/pressable');
    const PIXI = require('com/pixijs/pixi');
    const prizeData = require('skbJet/componentManchester/standardIW/prizeData');
    const resLib = require('skbJet/component/resourceLoader/resourceLib');
    const orientation = require('skbJet/componentManchester/standardIW/orientation');
    const msgBus = require('skbJet/component/gameMsgBus/GameMsgBus');

    require('com/gsap/TweenMax');
    const Tween = window.TweenMax;

    require('com/gsap/TimelineMax');
    const Timeline = window.TimelineMax;


    let bonusPointAnimationMap = {
        'M25': '10x',
        'M24': '15x',
        'M23': '20x',
        'M22': '25x',
        'M21': '30x',
        'M20': '35x',
        'M19': '40x',
        'M18': '45x',
        'M17': '50x',
        'M16': '55x',
        'M15': '60x',
        'M14': '65x',
        'M13': '70x',
        'M12': '75x',
        'M11': '80x',
        'M10': '90x',
        'M9': '100x',
        'M8': '150x',
        'M7': '200x',
        'M6': '250x',
        'M5': '300x',
        'M4': '350x',
        'M3': '400x',
        'M2': '450x',
        'M1': '500x',
    };

    class BonusPoint extends Pressable {
        constructor(index) {
            super();

            this.index = index;
            this.cover = new PIXI.spine.Spine(resLib.spine['megaMatchTiles'].spineData);
            this.spine = new PIXI.spine.Spine(resLib.spine['specialSymbols'].spineData);
            this.spine.scale.set(0.7);

            this.background = new PIXI.spine.Spine(resLib.spine['megaMatchTiles'].spineData);

            this.hitArea = new PIXI.Rectangle(-75, -45, 150, 85);

            this.spine.x = 87;
            this.spine.y = 55;

            this.spine.renderable = false;

            this.value = undefined;
            this.valueText = new PIXI.Sprite(PIXI.Texture.EMPTY);
            this.valueText.anchor.set(0.5);
            this.valueText.position.set(0, 3);
            this.valueTextEcho = new PIXI.Sprite(PIXI.Texture.EMPTY);
            this.valueTextEcho.anchor.set(0.5);
            this.valueTextEcho.position.set(0, 3);

            this.multiplierValue = "";
            this.multiplierSet = false;

            this.prizeValue = 0;
            this.revealed = false;

            this.buttonPressed = false;

            this.winStateSet = false;

            this.pointArray = [];

            this.addChild(this.background, this.valueText, this.valueTextEcho, this.cover);

            this.onOrientationChange();

            this.cover.state.addListener({
                complete: (entry) => {
                    if (
                        entry.animation.name === "landscapeAnimations/FoilReveal1Landscape" ||
                        entry.animation.name === "portraitAnimations/foilReveal1Portrait"
                    ) {
                        if (this.onUncoverComplete !== undefined) {
                            this.onUncoverComplete();
                        }
                    }
                }
            });

            this.background.state.addListener({
                complete: (entry) => {
                    if (
                        entry.animation.name === "landscapeAnimations/winBaseLandscape" ||
                        entry.animation.name === "portraitAnimations/winBasePortrait"
                    ) {
                        let anim = orientation.get() === orientation.LANDSCAPE ?
                            'landscapeAnimations/multiplierMatchLandscape' :
                            'portraitAnimations/multiplierMatchPortrait';
                        this.background.state.setAnimation(0, anim, true);

                    }
                }
            });

            this.idleTimeline = new Timeline({ repeat: -1 });

            this.idleTimeline.to(this.cover, 0.5, { pixi: { contrast: 3 } }, 0);
            this.idleTimeline.to(this.cover, 0.5, { pixi: { contrast: 1 } }, 0.5);

            msgBus.subscribe('GameSize.OrientationChange', this.onOrientationChange.bind(this));
        }

        enable() {
            return new Promise(resolve => {
                this.reveal = resolve;
                this.interactive = true;
                this.enabled = true;
            }).then(() => {
                this.enabled = false;
                this.interactive = false;
            });
        }

        onMouseDown() {
            this.reveal();
        }

        reset() {
            this.prizeValue = 0;
            this.valueText.texture = PIXI.Texture.EMPTY;
            this.valueTextEcho.texture = PIXI.Texture.EMPTY;
            this.valueText.alpha = 1;

            this.value = undefined;
            this.multiplierValue = "";
            this.multiplierSet = false;
            this.revealed = false;

            this.buttonPressed = false;

            let anim = orientation.get() === orientation.LANDSCAPE ?
                'landscapeAnimations/FoilReveal1Landscape' :
                'portraitAnimations/foilReveal1Portrait';
            this.cover.state.setAnimation(0, anim, true);
            this.cover.state.tracks[0].time = 0;
            this.cover.state.timeScale = 0;
            this.cover.state.tracks[0].loop = true;

            anim = orientation.get() === orientation.LANDSCAPE ?
                'landscapeAnimations/transitionBaseLandscape' :
                'portraitAnimations/transitionBasePortrait';
            this.background.state.setAnimation(0, anim, true);

            this.winStateSet = false;

            this.idleTimeline.restart();
            this.idleTimeline.play();

        }

        disable() {
            this.enabled = false;
        }

        uncover() {
            let anim = orientation.get() === orientation.LANDSCAPE ?
                'landscapeAnimations/FoilReveal1Landscape' :
                'portraitAnimations/foilReveal1Portrait';

            return new Promise(resolve => {
                this.enabled = false;
                this.revealed = true;
                this.onUncoverComplete = resolve;
                this.cover.state.setAnimation(0, anim, false);
                this.cover.state.timeScale = 1;
            });
        }

        setValue(val) {
            this.value = val;
            this.prizeValue = prizeData.prizeTable[this.value];
            this.valueText.texture = new PIXI.Texture.from("megaMatchValues/" + bonusPointAnimationMap[this.value]);
            this.multiplierValue = bonusPointAnimationMap[this.value];

            Tween.to(this.valueText.scale, 0.5, {
                x: 1.3,
                y: 1.3,
                repeat: 1,
                ease: "power4.out",
                yoyo: true
            });
        }

        dim() {
            Tween.to(this.valueText, 0.5, {
                alpha: 0.5
            });
        }

        setToWinState() {
            if (!this.winStateSet) {
                this.winStateSet = true;
                let anim = orientation.get() === orientation.LANDSCAPE ?
                    'landscapeAnimations/winBaseLandscape' :
                    'portraitAnimations/winBasePortrait';
                this.background.state.setAnimation(0, anim, false);
                this.valueText.texture = new PIXI.Texture.from("megaMatchValues/" + bonusPointAnimationMap[this.value] + 'Win');
                this.valueTextEcho.texture = new PIXI.Texture.from("megaMatchValues/" + bonusPointAnimationMap[this.value] + 'Win');
                this.valueTextEcho.alpha = 1;

                Tween.to(this.valueTextEcho.scale, 0.3, {
                    x: 5,
                    y: 5
                });
                Tween.to(this.valueTextEcho, 0.3, {
                    alpha: 0
                });
            }
        }

        onOrientationChange() {
            let time = 0;

            if (this.cover.state.tracks.length > 0) {
                if(this.revealed) {
                    time = 1.7;
                }
            }

            let anim = orientation.get() === orientation.LANDSCAPE ?
                'landscapeAnimations/FoilReveal1Landscape' :
                'portraitAnimations/foilReveal1Portrait';
            this.cover.state.setAnimation(0, anim, true);
            this.cover.state.tracks[0].time = time;
            this.cover.state.tracks[0].loop = false;

            anim = orientation.get() === orientation.LANDSCAPE ?
                'landscapeAnimations/transitionBaseLandscape' :
                'portraitAnimations/transitionBasePortrait';
            this.background.state.setAnimation(0, anim, true);

            if (this.winStateSet) {
                let anim = orientation.get() === orientation.LANDSCAPE ?
                    'landscapeAnimations/multiplierMatchLandscape' :
                    'portraitAnimations/multiplierMatchPortrait';
                this.background.state.setAnimation(0, anim, true);
            }
        }

        static fromContainer(container, index) {
            const valve = new BonusPoint(index);
            container.addChild(valve);
            return valve;
        }
    }

    return BonusPoint;
});