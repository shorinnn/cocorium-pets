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
            this.public_properties = ['name', 'age', 'health', 'karma', 'hunger'];
            this.public_actions = [ 'kill', 'feed', 'move' ];
            this.intervals = ['ageInterval','starveInterval'];
            this._growOldRate = 60 * 1000;
            this._starveRate = randomNum(5, 60) * 1000;
            
            if(!name){
                for (var prop in saved) this[prop] = saved[prop];
            }

            this.start = function(){
                $('.stage').append( this.html );
                this.info( this.name+' is born!');
                this.growOld();
                this.starve();
            };

            this.stats = function(){
                str = '';
                var self = this;
                oldKarma = this.karma;
                if(this._karmaLevel <= - 5 ) this.karma = 'bad';
                else if(this._karmaLevel <= 5) this.karma = 'neutral';
                else this.karma = 'good';
                this._updateFace(oldKarma);
                
                $(this.public_properties).each(function(index, prop){
                    str+= prop+": "+self[prop]+"<br />";
                });
                $('.property-bar').html(str);

                str = '';
                $(this.public_actions).each(function(index, prop){
                    str+= "<button class='btn btn-primary' onclick='main.pet."+prop+"()'>"+prop+"</button> ";
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
                    self.info( this.name+' is now '+self.age+' '+years+' old');

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
                }, this._starveRate, self);
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
            };

            this.damage = function( dmg ){
                this.health -= dmg;
                this.stats();
                this.danger( this.name+' is losing health! (-'+dmg+')' );
                if(this.health <= 0 ) this.die();
            };

            this.info = function( str ){
                $('.message-bar').prepend('<p class="info">'+str+'</p>');
            };
            this.warning = function( str ){
                $('.message-bar').prepend('<p class="warning">'+str+'</p>');
            };
            this.danger = function( str ){
                $('.message-bar').prepend('<p class="danger">'+str+'</p>');
            };
            this.success = function( str ){
                $('.message-bar').prepend('<p class="success">'+str+'</p>');
            };

            this.kill = function(){
                if(this.health<=0) return false;
                main.gun_snd.play();
                this.damage(1000);
                this.danger( this.name+' killed itself. Nice going... ');
            };
            this.feeding = false;
            this.feed = function( item ){
                
                if( !this.feeding )  this.info('[CLICK ON A FOOD ITEM TO FEED '+this.name+']');
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
                    this.updateKarma(item.karma);
                    this.stats();
                }
            };
            
            this.updateKarma = function(karma){
                oldKarma = this._karmaLevel;
                this._karmaLevel += karma;
                if(oldKarma > -5 && this._karmaLevel <= -5 ){// went from neutral karma to bad
                     this._growOldRate -= 300;
                     this._starveRate -= 1000;
                     this.danger( this.name+' has bad karma now, and life will get tougher.');
                }
                if(oldKarma <= -5 && this._karmaLevel > -5){ // went from bad to neutral
                    this._growOldRate += 300;
                    this._starveRate += 1000;
                    this.info( this.name+' changed his ways, and with his current neutral karma life will get a little easier.');
                }
                
                if(oldKarma <= 5 && this._karmaLevel > 5 ){// went from neutral karma to good
                    this._growOldRate += 300;
                    this._starveRate += 1000;
                    this.success( this.name+' is a great fella, and life is a walk in the park.');
                }
                if(oldKarma > 5 && this._karmaLevel <= 5){ // went from good to neutral
                    this._growOldRate -= 300;
                    this._starveRate -= 1000;
                    this.warning( this.name+" stopped being awesome, life's not going to be all peachy.");
                }
                
                
            };
            
            this._updateFace = function(oldKarma){
                if(oldKarma == this.karma) return;
                $('.pet').removeClass('pet-good');
                $('.pet').removeClass('pet-bad');
                if(this.karma == 'good' ) $('.pet').addClass('pet-good');
                else if(this.karma == 'bad') $('.pet').addClass('pet-bad');
                else{}
            };

            this.moving = false;
            this.move = function(){  
                if( !this.moving ){
                    this.info('[CLICK ON THE SPOT WHERE YOU WANT  '+this.name+' TO GO TO]');
                    $('.canvas').click( function(e){ 
                        main.pet.doMove(e) ;
                        
                    });
                }
                else{
                    $('.canvas').off('click');
                }
                $('.pet').toggleClass('shake shake-constant shake-slow');
                this.moving = !this.moving;
            };
            
            this.doMove = function(e){
                main.move_snd.play();
                var x;
                var y;
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
                this.stats();
            };
            
            this.js = function(){
                main.keyboard_snd.play();
            };
            
            this.game = function(){
                main.game_snd.play();
            };
            
            this.work = function(){
                main.whip_snd.play();
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
            return this;
        }
    };