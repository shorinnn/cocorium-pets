var cocoriumEnemy = {
    new : function(name){
        this.name = name;
        this.id = 'enemy'+randomNum(100,999);
        func = "main.enemies['"+this.id+"'].fightOff()";
        this.html = "<div id='"+this.id+"' onclick=\""+func+"\" class=' content shake shake-constant enemy "+this.name+"'></div>";
        
        this.attack = function(){
            $('.canvas').append( this.html );
            $('#'+this.id).css('left', randomNum($('.canvas').outerWidth() - 250, $('.canvas').outerWidth() - 50 ));
            $('#'+this.id).css('top', randomNum(20, $('.canvas').outerHeight()/2 - 50 ));
            main.danger('Watch out! '+this.name+' is attacking. CLICK HIM to avoid getting humpt.');
            self = this;
            main.dun_snd.play();
            this.timeOut = setTimeout(function(self){
                self.hump();
            }, 2000, self);
        };
        
        this.hump = function(){
            dmg = randomNum(10, 20);
            main.danger('You got humpt by '+this.name+'!');
            $('#'+this.id).removeClass('shake shake-constant');
            $('#'+this.id).animate({
                left: $('.pet').offset().left+'px',
                top: $('.pet').offset().top+'px'
            }, 500, function(){
                main.pain_snd.play();
            });
            
            main.pet.damage(dmg);
            self = this;
            setTimeout(function(self){
                $('#'+self.id).fadeOut();
            }, 1000, self);
        };
        
        this.fightOff = function(){
            main.sword_snd.play();
            main.success('You fought off the evil '+this.name+'!');
            clearTimeout( this.timeOut );
            $('#'+this.id).removeClass('shake shake-constant');
//            $('#'+this.id).fadeOut( 1000 );
            $('#'+this.id).effect( 'explode', {}, 500 );
            
        };
        
        this.explode = function(){			
		// Hide the content box so we can see the particles fly.
		$('.clipped-box .content').css({'display' : 'none'});	
	
		// Apply to each clipped-box div.   
		$('.clipped-box div:not(.content)').each(function() {
				
			// So the speed is a random speed between 90m/s and 120m/s. I know that seems like a lot
			// But otherwise it seems too slow. That's due to how I handled the timeout.
			var v = rand(120, 90),
				angle = rand(80, 89), // The angle of projection is a number between 80 and 89 degrees.
				theta = (angle * Math.PI) / 180, // Theta is the angle in radians
				g = -9.8; // And gravity is -9.8. If you live on another planet feel free to change
					
			// $(this) as self
			var self = $(this);

			// time is initially zero, also set some random variables. It's higher than the total time for the projectile motion
			// because we want the squares to go off screen. 
			var t = 0,
				z, r, nx, ny,
				totalt =  15;
				
			// The direction can either be left (1), right (-1) or center (0). This is the horizontal direction.
			var negate = [1, -1, 0],
				direction = negate[ Math.floor(Math.random() * negate.length) ];
				
			// Some random numbers for altering the shapes position
			var randDeg = rand(-5, 10), 
				randScale = rand(0.9, 1.1),
				randDeg2 = rand(30, 5);
			
			// Because box shadows are a bit laggy (by a bit I mean 'box shadows will not work on individual clipped divs at all') 
			// we're altering the background colour slightly manually, in order to give the divs differentiation when they are
			// hovering around in the air.
			var color = $(this).css('backgroundColor').split('rgb(')[1].split(')')[0].split(', '),
				colorR = rand(-20, 20),  // You might want to alter these manually if you change the color
				colorGB = rand(-20, 20),  // To get the right consistency.
				newColor = 'rgb('+(parseFloat(color[0])+colorR)+', '+(parseFloat(color[1])+colorGB)+', '+(parseFloat(color[2])+colorGB)+')';
		
				
			// And apply those
			$(this).css({
				'transform' : 'scale('+randScale+') skew('+randDeg+'deg) rotateZ('+randDeg2+'deg)', 
				'background' : newColor
			});
                    });
        };
        return this;
        
    }
};
