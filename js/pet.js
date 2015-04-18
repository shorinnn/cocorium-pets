var cocoriumPet = {
    new : function(name, saved){
            this.name = name;
            this.age = 0;
            this.html = "<div class='pet' title='"+name+"'></div>";
            this.health = 100;
            this.maxAge = randomNum(40, 120);
            this.hunger = '0%';
            this._hungerLevel = 0;
            this.karma = 'neutral';
            this._karmaLevel = 0;
            this.public_properties = ['name', 'intelligence', 'personality', 'age', 'health', 'karma', 'hunger'];
            this.public_actions = [ 'kill', 'feed', 'move', 'jog', 'EnableEnemies' ];
            this.intervals = ['ageInterval','starveInterval'];
            this.__growOldRate = 0;
            this.__starveRate =  0;
            this._growOldRate = 60 * 1000;
            this._starveRate =  1000;
            this.revived = false;
            this.intelligence = 'Regular';
            this._intelligenceLevel = 50;
            this.personality = 'Normal';
            this._personalityLevel = 50;
            
            this.getStarveRate = function(){
                return randomNum(5, 60) * this._starveRate + this.__starveRate;
            };
            
            if(!name){
                for (var prop in saved) this[prop] = saved[prop];
                this.revived = true;
            }

            this.start = function(){
                $('.stage').append( this.html );
                main.info( this.name+' is born!');
                this.growOld();
                this.starve();
                if( this.revived ){
                    this._updateFace('revive');
                }
            };

            this.stats = function(){
                str = '';
                var self = this;
                
                $(this.public_properties).each(function(index, prop){
                    str+= prop+": "+self[prop]+"<br />";
                });
                $('.property-bar').html(str);

                str = '';
                $(this.public_actions).each(function(index, prop){
                    str+= "<button class='btn btn-primary "+prop+"' onclick='main.pet."+prop+"()'>"+prop+"</button> ";
                });
                $('.action-bar').html(str);
            };

            this.ageInterval = null;
            this.growOld = function(){
                self = this;
                this.ageInterval = setInterval(function(self){
                    self.age++;
                    self.stats();
                    main.birthday_snd.play();
                    years = self.age==1 ? 'year' : 'years';
                    main.info( this.name+' is now '+self.age+' '+years+' old');

                    if( self.age < 60 ){
                        $('.pet').outerWidth( $('.pet').outerWidth() + 1);
                        $('.pet').outerHeight( $('.pet').outerHeight() + 1);
                        if(self.age>45){
                            $('.pet').outerWidth( $('.pet').outerWidth() + 1);
                        }
                    }
                    else{
                        $('.pet').outerWidth( $('.pet').outerWidth() - 1);
                        $('.pet').outerHeight( $('.pet').outerHeight() - 1);
                    }
                    if(self.age >= self.maxAge) self.die();
                }, this._growOldRate, self );
            };

            this.starveInterval = null;
            this.starve = function(){
                self = this;
                this.starveInterval = setInterval(function(self){
                    self._hungerLevel += randomNum(1, 5);
                    self.hunger = self._hungerLevel+'%';
                    if(self._hungerLevel >= 100){
                        self._hungerLevel = 100;
                        self.hunger = self._hungerLevel+'%';
                        self.damage( randomNum(1, 5) );
                    }
                    self.stats();
                    if( self._hungerLevel > 80 && self._hungerLevel < 90){
                        self.warning( self.name+ ' is hungry. You should feed it.');
                        main.starve_snd.play();
                    }
                    if( self._hungerLevel > 90){
                        self.danger( 'FEED '+self.name+ ' for god`s sake!');
                    }
                }, this.getStarveRate() , self);
            };

            this.die = function(){
                setTimeout(function(){
                    main.bells_snd.play();
                },1000);
                
                $('.pet').remove();
                self = this;
                $(this.intervals).each(function(index, prop){
                    str+= "<button class='btn btn-primary' onclick='main.pet."+prop+"()'>"+prop+"</button> ";
                    clearInterval( self[prop] );
                });

                $('.canvas').addClass('game-over');
                $('.canvas').html( "Oh noes, "+this.name+" passed away. <br /> ✞✞✞ GAME OVER ✞✞✞" );
                
                main.gameOver = true;
            };

            this.damage = function( dmg ){
                this.health -= dmg;
                main.danger( this.name+' is losing health! (-'+dmg+')' );
                if(this.health <= 0 ){
                    this.health = 0;
                    this.die();
                }
                this.updatePet();
            };

            
            this.EnableEnemies = function(){
                $('.EnableEnemies').hide();
                main.unleashEnemies();
            };
            this.kill = function(){
                if(this.health<=0) return false;
                main.gun_snd.play();
                this.damage(1000);
                main.danger( this.name+' killed itself. Nice going... ');
            };
            
            this.feeding = false;
            this.feed = function( item ){
                
                if( !this.feeding )  main.info('[CLICK ON A FOOD ITEM TO FEED '+this.name+']');
                this.feeding = !this.feeding;
               
                $('.food').toggleClass('eatable');
                $('.food').toggleClass('shake shake-constant hover-stop shake-slow');

                for(i=0; i< main.public_foods.length; ++i){
                    food = main.public_foods[i];
                    main.foods[food].eatable = !main.foods[food].eatable;
                }
                
                if(typeof(item)!='undefined'){
                    this._hungerLevel -= item.nutrition;
                    if(this._hungerLevel < 0) this._hungerLevel = 0;
                    this.hunger = this._hungerLevel+'%';
                    this.health += ( item.nutrition / 2);
                    if( this.health > 100) this.health = 100;
                    this.setKarma(item.karma);
                }
                this.updatePet();
            };
            
            

            this.moving = false;
            this.move = function(){  
                if( !this.moving ){
                    main.info('[CLICK ON THE SPOT WHERE YOU WANT  '+this.name+' TO GO TO]');
                    $('.canvas').click( function(e){ 
                        main.pet.doMove(e) ;
                        
                    });
                    $('.pet').addClass('shake shake-constant shake-slow');
                    this.moving = true;
                }
                else{
                    $('.canvas').off('click');
                    $('.pet').removeClass('shake shake-constant shake-slow');
                    this.moving = false;
                }
                
                
            };
            
            
            this.doMove = function(e, x, y){
                main.move_snd.play();
//                var x;
//                var y;
                if(e != false){
                    if (e.pageX || e.pageY) { 
                      x = e.pageX;
                      y = e.pageY;
                    }
                    else { 
                      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
                      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
                    } 
                    x -= $('.pet').outerWidth();
                    y -= $('.pet').outerHeight();
                }
                $('.pet').animate({
                    left: x+'px',
                    top: y+'px'
                }, 1400);
                
                this.health += randomNum(2, 8);
                if(this.health > 100) this.health = 100;
                this._hungerLevel += randomNum(1, 10);
                if(this._hungerLevel>100) this._hungerLevel = 100;
                this.hunger = this._hungerLevel+'%';
                
                this.move();
                this.updatePet();
            };
            
            this._sprints = 0;
            this._currentSprint = 0;
            this.jog = function(){
                this._sprints = randomNum(3, 5);
                this._currentSprint = 0;
                this.doJog();
            };
            
            this.doJog = function(){
                this.moving = true;
                x = randomNum(100, $('.canvas').outerWidth() *.7);
                y = randomNum(100, $('.canvas').outerHeight() *.7);
                this.doMove(false, x, y);
                this._currentSprint++;
                if( this._currentSprint < this._sprints){
                    self = this;
                    setTimeout( function(self){
                        self.doJog();
                    }, 2200, self);
                }
                else{
                    main.success('That was a good jog (health through the roof)!');
                }
            };
            
            this.js = function(){
                main.keyboard_snd.play();
                val =  randomNum(1, 10);
                this.setIntelligence( val );
                main.info( this.name+" practiced some JS (intelligence +"+val+')');
                if( randomNum(1,10) > 6){
                    val = randomNum(5, 15);
                    this.setPersonality( - val );
                    main.warning( "All that js made "+this.name+" a bit awkward(personality -"+val+')');
                }
                this.updatePet();
            };
            
            
            
            this.game = function(){
                main.game_snd.play();
                intel =  randomNum( -5, 5);
                this.setIntelligence( intel );
                val = randomNum( 1, 5);
                this.setPersonality( val );
                main.warning( "That's a good gaming session (personality: "+val+', intelligence: '+intel+')');
            };
            
            this.work = function(){
                main.whip_snd.play();
                intel =  randomNum( -3, 0);
                this.setIntelligence( intel );
                val = randomNum( -3, 0);
                this.setPersonality( val );
                karma = randomNum(-3,0);
                this.setKarma( karma );
                main.warning( "That's a good gaming session (personality: "+val+', intelligence: '+intel+', karma: '+karma+')');
                
                setTimeout(function(){
                    main.whip_2_snd.play();
                }, 600);
            };
            
            this.saveProgress = function(){
                $.bootstrapGrowl("Progress saved.",{
                    align: 'center',
                    type: 'success'
                });
                main.save_snd.play();
                localStorage.setItem('save', JSON.stringify( this ) );
            };
            
            
            
            this.setIntelligence = function (val){
                this._intelligenceLevel += val;
                if(this._intelligenceLevel > 100) this._intelligenceLevel = 100;
                if(this._intelligenceLevel >0 && this._intelligenceLevel <=10) this.intelligence = 'Veggie';
                if(this._intelligenceLevel >10 && this._intelligenceLevel <=20) this.intelligence = 'Stoopid';
                if(this._intelligenceLevel >20 && this._intelligenceLevel <=30) this.intelligence = 'Kinda Slow';
                if(this._intelligenceLevel >30 && this._intelligenceLevel <=40) this.intelligence = 'Below Average';
                if(this._intelligenceLevel >40 && this._intelligenceLevel <=60) this.intelligence = 'Regular';
                if(this._intelligenceLevel >60 && this._intelligenceLevel <=70) this.intelligence = 'Smart Cookie';
                if(this._intelligenceLevel >70 && this._intelligenceLevel <=80) this.intelligence = 'Gifted';
                if(this._intelligenceLevel >80 && this._intelligenceLevel <=90) this.intelligence = 'Brilliant';
                if(this._intelligenceLevel >90 && this._intelligenceLevel <=100) this.intelligence = 'Damn Genius!';                
                this.updatePet();
            };
            
            this.setPersonality = function (val){
                this._personalityLevel += val;
                if(this._personalityLevel > 100) this._personalityLevel = 100;
                if(this._personalityLevel >0 && this._personalityLevel <=10) this.personality = 'Horrible';
                if(this._personalityLevel >10 && this._personalityLevel <=20) this.personality = 'Depressing';
                if(this._personalityLevel >20 && this._personalityLevel <=30) this.personality = 'A Drag';
                if(this._personalityLevel >30 && this._personalityLevel <=40) this.personality = 'Slightly boring';
                if(this._personalityLevel >40 && this._personalityLevel <=60) this.personality = 'Normal';
                if(this._personalityLevel >60 && this._personalityLevel <=70) this.personality = 'Interesting';
                if(this._personalityLevel >70 && this._personalityLevel <=80) this.personality = 'Fun';
                if(this._personalityLevel >80 && this._personalityLevel <=90) this.personality = 'Charismatic';
                if(this._personalityLevel >90 && this._personalityLevel <=100) this.personality = 'Women want to be with '+this.name+' and men want to be like '+this.name;
                this.updatePet();
            };
            
            
            
            this.setKarma = function(karma){
                oldKarma = this._karmaLevel;
                this._karmaLevel += karma;
                if(oldKarma > -5 && this._karmaLevel <= -5 ){// went from neutral karma to bad
                     this.__growOldRate -= 300;
                     this.__starveRate -= 1000;
                     main.danger( this.name+' has bad karma now, and life will get tougher.');
                }
                if(oldKarma <= -5 && this._karmaLevel > -5){ // went from bad to neutral
                    this.__growOldRate += 300;
                    this.__starveRate += 1000;
                    main.info( this.name+' changed his ways, and with his current neutral karma life will get a little easier.');
                }
                
                if(oldKarma <= 5 && this._karmaLevel > 5 ){// went from neutral karma to good
                    this.__growOldRate += 300;
                    this.__starveRate += 1000;
                    main.success( this.name+' is a great fella, and life is a walk in the park.');
                }
                if(oldKarma > 5 && this._karmaLevel <= 5){ // went from good to neutral
                    this.__growOldRate -= 300;
                    this.__starveRate -= 1000;
                    main.warning( this.name+" stopped being awesome, life's not going to be all peachy.");
                }
                
                if(this._karmaLevel <= - 5 ) this.karma = 'bad';
                else if(this._karmaLevel <= 5) this.karma = 'neutral';
                else this.karma = 'good';
                this._updateFace(oldKarma);
                this.updatePet();
            };
            
            this._updateFace = function(oldKarma){
                if(oldKarma == this.karma) return;
                $('.pet').removeClass('pet-good');
                $('.pet').removeClass('pet-bad');
                if(this.karma == 'good' ) $('.pet').addClass('pet-good');
                else if(this.karma == 'bad') $('.pet').addClass('pet-bad'); 
                else{}
            };
            
            this.updatePet = function(){
                this.stats();
            };
            
            return this;
        }
    };