var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var s2n     = require('string-to-number');

var outfile = "data.json";
var godnames = [
  { nameReal : "Mork" ,     nameGod : "TheMork"              },
  { nameReal : "Shwam" ,    nameGod : "Lord Shwam The Third" },
  { nameReal : "Cobnot" ,   nameGod : "God Of Shenanigans"   },
  { nameReal : "Olive" ,    nameGod : "Flannel Of happiness" },
  { nameReal : "Andy-Rew" , nameGod : "Lord Wensleydale"     },
  { nameReal : "Kush" ,     nameGod : "the hokey dokey"      },
  { nameReal : "Pink" ,     nameGod : "Hathena"              },
  { nameReal : "Jaime" ,    nameGod : "The Desheather"       },
];

var data = {};
data.time = Date.now();
data.timePretty = new Date().toGMTString();
data.gods = [];
var scope;
God = function( g )
{
  request ( "http://godvillegame.com/gods/" + g, function( error, response, html ){
    if ( !error ) {
      $ = cheerio.load ( html );
      console.log( $( "#column_3 tr" )[0].children[0].children[0].data );
      console.log( $( "#column_3 tr" )[0].children[0].children[0].data );
      console.log()
      scope = this;
      this.nameReal = g;
      this.nameGod = $( "#god h2")[0].children[0].data.trim();
      this.nameHero = $( "#essential_info h3")[0].children[0].data.trim();
      this.level = parseInt( $( ".level")[0].children[0].data.trim().replace( "level ", "" ) );
      this.motto = $( ".motto")[0].children[0].data.trim();
      this.gender = $( "td.label:contains('Gender')")[0].parent.children[3].children[0].data;
      this.ageStr = $( "td.label:contains('Age')")[0].parent.children[3].children[0].data;
      this.personality = $( "td.label:contains('Personality')").parent().children()[1].children[0].data.trim();
      this.guildName = $( ".name.guild a")[0].children[0].data.trim();
      this.guildRank = $( ".guild_status")[0].children[0].data.trim().replace( "(", "" ).replace( ")", "" ).trim();
      this.goldStr = $( "td.label:contains('Gold')").parent().children()[1].children[0].data.trim();
        this.goldNum = s2n( "0 " + this.goldStr.replace( "about ", "" ).replace( /[1-9]/g, '+ ' + '$&' + ' * ' ) )
      this.killedStr = $( "td.label:contains('Monsters Killed')").parent().children()[1].children[0].data.trim();
        this.killedNum = s2n( "0 " + this.killedStr.replace( "about ", "" ).replace( /[1-9]/g, '+ ' + '$&' + ' * ' ) )
      this.deaths = parseInt( parseInt( $( "td.label:contains('Death Count')").parent().children()[1].children[0].data ) );
      this.wins = parseInt( $( "td.label:contains('Wins / Losses')")[0].parent.children[3].children[0].data.trim().replace( / \/ [0-9]*/g, "" ) );
      this.loses = parseInt( $( "td.label:contains('Wins / Losses')")[0].parent.children[3].children[0].data.trim().replace( /[0-9]* \/ /g, "" ) );
      this.bricks = parseInt( $( "td.label:contains('Bricks for Temple')").parent().children()[1].children[0].data.replace( ".", "" ) );
      if( $( "td.label:contains('Pet')").length > 0 ) { this.pet = $( "td.label:contains('Pet')").parent().children()[1].children[0].data.trim(); }
      this.equipment = [];
      $( "#column_2 tr").each(function( index ) {
        scope.equipment.push({
          label : this.children[1].children[0].data,
          name :  this.children[3].children[0].data,
          value : parseInt( this.children[5].children[0].data.replace( "+", "" ) )
        });
      });
      this.skills = [];
      $( "#column_2 .b_list li").each(function( index ) {
        skill = $( this ).text().toString();
        scope.skills.push ({
         name : skill.substring( 0 , skill.indexOf( "level" ) ),
         level : parseInt( skill.substring( skill.indexOf( "level" ) + 6 ) )
        })
      });
      this.pantheons = [];
      $( "#column_3 tr").each(function( index ) {
        item = this;
        if ( this.children[0] !== '<div class="panth_div"></div>' ) {
          scope.pantheons.push({
            name : this.children[0].children[0].data,
            rank : this.children[1].children[0].data
          });
        }
      });
      this.achievements = [];
      $( "#column_3 .b_list li").each(function( index ) {
        scope.achievements.push ({
          name : $( this ).text().toString().substring( 0, $( this ).text().toString().indexOf( "," ) ),
          rank : parseInt( $( this ).text().toString().substring($( this ).text().toString().indexOf( "," ) + 1) ),
          about : this.getAttribute( "title" )
        });
      });
    }
  }.bind(this));
}

//app.get('/', function(req, res){
  godnames.forEach( function(x){
    data.gods.push( new God ( x.nameGod ) );
  });
  function wait(){
    if (!data.gods[godnames.length-1].nameHero){
      setTimeout(wait,100);
    } else {
      console.log(JSON.stringify(data));
      fs.writeFile( outfile , JSON.stringify( data , null , 4 ), function( err ){ console.error( "Error: " + err ); } )
    }
  }
//});
app.listen( 8080 , function() { console.log( "running" ) } );
