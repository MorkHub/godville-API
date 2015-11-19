var express          = require('express');
var request          = require('request');
var cheerio          = require('cheerio');
var fs               = require('fs');
var string_to_number = require('string-to-number');
var s2n              = new string_to_number();
var app              = express();

var outfile = "C:/wamp/www/gods/data.json";
var godnames = [
  { nameReal : "Mork" ,     nameGod : "TheMork"              },
  { nameReal : "Shwam" ,    nameGod : "Lord Shwam The Third" },
  { nameReal : "Cobnot" ,   nameGod : "God Of Shenanigans"   },
  { nameReal : "Olive" ,    nameGod : "Flannel Of happiness" },
  { nameReal : "Andy-Rew" , nameGod : "Lord Wensleydale"     },
  { nameReal : "Kush" ,     nameGod : "the hokey dokey"      },
  { nameReal : "Pink" ,     nameGod : "Hathena"              },
  { nameReal : "Jaime" ,    nameGod : "The Desheather"       }
];

function getScore( god )
{
  return Math.round(
      0
      + god.equipment*10
      + god.bricks*10
      + (5*god.level*god.level)/Math.sqrt(god.level)
      + Math.sqrt(god.goldNum/10)
      - (god.deaths*god.deaths)*3
  );
}

var data = {};
data.time = Date.now();
data.timePretty = new Date().toGMTString();
data.data = [];
var scope;
var error;
God = function( g )
{
  request ( "http://godvillegame.com/gods/" + g.nameGod, function( e, response, html ){
    if ( !e ) {
      $ = cheerio.load ( html );
      scope = this;
      this.done = false;
      this.nameReal = g.nameReal;
      this.nameGod = $( "#god h2")[0].children[0].data.trim();
      this.nameHero = $( "#essential_info h3")[0].children[0].data.trim();
      this.level = parseInt( $( ".level")[0].children[0].data.trim().replace( "level ", "" ) );
      this.motto = $( ".motto")[0].children[0].data.trim();
      this.gender = $( "td.label:contains('Gender')")[0].parent.children[3].children[0].data;
      this.ageStr = $( "td.label:contains('Age')")[0].parent.children[3].children[0].data;
      this.ageHours = 0;
      this.ageHours = s2n.convert( this.ageStr.replace("about ","") );
      this.personality = $( "td.label:contains('Personality')").parent().children()[1].children[0].data.trim();
      this.guildName = $( ".name.guild a")[0].children[0].data.trim();
      this.guildRank = $( ".guild_status")[0].children[0].data.trim().replace( "(", "" ).replace( ")", "" ).trim();
      this.goldStr = $( "td.label:contains('Gold')").parent().children()[1].children[0].data.trim();
      //this.goldNum = s2n.convert( "0 " + this.goldStr.replace( "about ", "" ).replace( /[1-9]/g, '+ ' + '$&' + ' * ' ) );
      this.goldNum = 0;
      this.goldNum = s2n.convert( this.goldStr.replace("about ","") );
      this.killedStr = $( "td.label:contains('Monsters Killed')").parent().children()[1].children[0].data.trim();
      //this.killedNum = s2n.convert( "0 " + this.killedStr.replace( "about ", "" ).replace( /[1-9]/g, '+ ' + '$&' + ' * ' ) );
      this.killedNum = s2n.convert( this.killedStr.replace("about","").trim() );
      this.deaths = parseInt( parseInt( $( "td.label:contains('Death Count')").parent().children()[1].children[0].data ) );
      this.wins = parseInt( $( "td.label:contains('Wins / Losses')")[0].parent.children[3].children[0].data.trim().replace( / \/ [0-9]*/g, "" ) );
      this.loses = parseInt( $( "td.label:contains('Wins / Losses')")[0].parent.children[3].children[0].data.trim().replace( /[0-9]* \/ /g, "" ) );
      this.bricks = parseInt( $( "td.label:contains('Bricks for Temple')").parent().children()[1].children[0].data.replace( ".", "" ) );
      if( $( "td.label:contains('Pet')").length > 0 )
      {
        temp = $( "td.label:contains('Pet')").parent().children()[1].children[1].data.trim();
        this.pet = {
          name : temp.replace( / [0-9]*(st|nd|rd|th) level/g, "" ),
          level : temp.replace( /[A-Z][a-z]* (.*?)(st|nd|rd|th) level/g, "$1" ),
          type : $( "td.label:contains('Pet')").parent().children()[1].children[0].children[0].data.trim()
        };
      }
      this.equipment = 0;
      this.equipmentList = [];
      $( "#column_2 tr").each(function( index ) {
        var tempLabel = this.children[1].children[0].data,
            tempName = this.children[3].children[0].data,
            tempValue = parseInt( this.children[5].children[0].data.replace( "+", "" ) );
        scope.equipmentList.push({ label : tempLabel , name : tempName , value : tempValue });
        scope.equipment = scope.equipment + tempValue;
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
        if ( this.children[0].attribs.colspan == undefined ) {
          var tempName, tempRank;
          if ( this.children[0].attribs.class ) tempName = this.children[0].children[0].data;
          if ( this.children[1].attribs.class ) tempRank =  this.children[1].children[0].data;
          if ( this.children[1].attribs.class ) scope.pantheons.push( { name : tempName, rank : tempRank } );
        }
      });
      this.achievements = [];
      $( "#column_3 .b_list li").each(function( index ) {
        scope.achievements.push ({
          name : $( this ).text().toString().substring( 0, $( this ).text().toString().indexOf( "," ) ),
          rank : parseInt( $( this ).text().toString().substring($( this ).text().toString().indexOf( "," ) + 1) ),
          about : this.attribs.title
        });
      });
      if ( this.goldNum == undefined) this.goldNum = 0
      if ( this.killedNum == undefined) this.killedNum = 0
      this.score = Math.ceil(
          0
          + this.equipment*10
          + this.bricks*10
          + (5*this.level*this.level)/Math.sqrt(this.level)
          + Math.sqrt(this.goldNum/10)
          - (this.deaths*this.deaths)*3);
      this.done = true;

      if ( this.done ) console.log( scope );
    } else { console.log ( error = e ); }
  }.bind(this));
}

//app.get('/', function(req, res){
  godnames.forEach( function(x){
    data.data.push( new God ( x ) );
  });
  wait()
  var complete;
  function wait(){
    complete = 0
    data.data.forEach(function(e){
      if ( e.done ) complete++;
    })
    if ( complete < data.data.length ){
      setTimeout( wait , 100 );
    } else {
      if ( !error )
      {
        //console.log( JSON.stringify( data ) );
        fs.writeFile( outfile , JSON.stringify( data , null , 4 ), function( err ){ if ( err ) { console.error( "Error: " + err ) } else { console.log( "Saved successfully!" ) } } )
      }
    }
  }
//});
app.listen( 8080 , function() { console.log( "running" ) } );
