var playerApp = angular.module('playerApp', []);

playerApp.controller('PlayerCtrl', function ($scope, $http, $location,$window, $dialogs,$timeout, fSharedService) {

  $scope.range_style = {
    width:'80%'
  };

  $scope.song_index = 0;
  $scope.show_list = false;
  $scope.current_audio = null;

  $scope.songs = [];

  $scope.escape = function(str){
    str.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
    return str;
  };


 $scope.$on('handleBroadcast', function() {

    log("listen broad cast on player page");

    var broadcast_data = fSharedService.message.data;
    switch(fSharedService.message.cmd){

      case 'play-songs':
        $scope.songs = broadcast_data.songs;
        $scope.song_index = broadcast_data.index;
        log("broadcast_data", broadcast_data);
        if ( broadcast_data.album_cover_id ){
          $scope.album_cover_id = broadcast_data.album_cover_id
        }
        else{
          $scope.album_cover_id = null;
        }

        $scope.initPlayer();
        
        break;

      case 'add-to-queue':
        //Check duplicate song
        var song =broadcast_data;
        for( var i =0; i < $scope.songs.length; i++ ){
          log("songs",$scope.songs);
          if ( $scope.songs[i]._id == song._id ){
            return $dialogs.message("This song has already in the playlist");
          }
        }
        $scope.songs.push( song );
        //This is the first song in the list, so init player
        if ($scope.songs.length == 1){
          $scope.song_index = 0;
          $scope.initPlayer();
        }
        break;
    }
  });

  $scope.initPlayer = function(){
    $('body').addClass("show-playlist");
    if ( !angular.isDefined($scope.audio)  ){
      //Should init intance audio first
      var as = audiojs.createAll($scope.audiojs_setting);
      $scope.audio =  as[0];
      $timeout(function(){
        $scope.setSong();
      });
    }
    else{
      $scope.setSong( );
    }
  }

  $scope.changeVolume = function(event){
    //log(event);
    //return;
    var instance = $(event.target);
    if ( !instance.hasClass('wrap-range') ){
      instance = instance.parent();
    }
    var parentOffset = instance.offset(); 
    var relX = event.pageX - parentOffset.left;
  
    console.log(relX);
    console.log(instance);
    var percent = relX/ instance.width();
    console.log(percent);
    $scope.range_style.width = relX +"%";
    //instance.find('.range').width( relX );
    $scope.audio.setVolume(percent);
    $dialogs.message('Current volume is ' + Math.round( percent * 100 ) + '%' );
  }

  $scope.animateLogo = function(){
    if ( $('.player-zone img.cover').length > 0 && $('#logo img').length >0  ){
      $scope.doAnimateLogo();      
    }
    else{
      //waiting for DOM
      $timeout(function(){
        $scope.doAnimateLogo();
      },500);      
    }
  }

  $scope.doAnimateLogo = function(){
    $('.player-zone img.cover').removeClass('playing');
    $('#logo img').addClass('animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
      $(this).removeClass('animated');
      $('.player-zone img.cover').addClass('playing');
    });    
  }

  $scope.init = function(){
    $scope.current_song = $scope.songs[ $scope.song_index ];
    $scope.album_cover_id = null;
    $scope.audiojs_setting = {
      callbackError:function(error){
        console.log(error);
        console.clear();
        var msg = $dialogs.error(error);
        //
        $timeout(function(){
          $('.player-zone img.cover').removeClass('playing');
        },1000);
        
      },
      callbackPlay:function(){
        console.log("callbackPlay");
        $scope.animateLogo();
      },
      callbackPause:function(){
        console.log("stop");
        $('.player-zone img.cover').removeClass('playing');
        
      },
      trackEnded: function() {
        $scope.$apply(function(){
          $scope.next();
        })
      }
    };  

    /*$timeout(function(){
      var as = audiojs.createAll($scope.audiojs_setting);
      $scope.audio =  as[0];
      $scope.audio.play();

    },500);*/

  }

  $scope.prev = function(){
    log("prev");
    $scope.song_index--;
    //$scope.song_index = $scope.song_index < 0 ? 0 :$scope.song_index;
    $scope.setSong();
    
  }
  $scope.removeOld = function(){

    $('.scrubber').remove();
    $('.played').remove();
    $('.duration').remove();
  }

  //Just make sure if it happended
  $scope.removeError = function(){
    if ($('.audiojs').hasClass('error')){
      $('.audiojs').removeClass('error');
    }
  }

  $scope.next = function(){
/*          var as = audiojs.createAll($scope.audiojs_setting);
      $scope.audio =  as[0];
      $scope.audio.play();*/
    log($scope.audio);
    $scope.audio.element.pause();
    
    log("next");
    $scope.song_index++;
    $scope.song_index = $scope.song_index >= $scope.songs.length ? 0 :$scope.song_index;
    $scope.setSong();
  }

  $scope.setSong = function(index){

    
    //$scope.audio.play();

    $scope.animateLogo();
    $scope.song_index == typeof(index) != "undefined" ? index: $scope.song_index;
    $scope.current_song = $scope.songs[ $scope.song_index ];
    $scope.removeError();
//    $scope.removeOld();
    //var as = audiojs.createAll($scope.audiojs_setting);
  //  $scope.audio =  as[0];
    $scope.audio.load( $scope.current_song.link );

    $timeout(function(){
      $scope.audio.play();
    },100);
  }

  $scope.playSong = function(index){
    log("how", index);
    $scope.song_index = index;
    $scope.setSong();
  }



});