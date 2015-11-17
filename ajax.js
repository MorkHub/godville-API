var godnames = [
  { nameReal : "Mork", nameGod : "TheMork" },
  { nameReal : "Shwam", nameGod : "Lord Shwam The Third" },
  { nameReal : "Cobnot", nameGod : "God Of Shenanigans" },
  { nameReal : "Olive", nameGod : "Flannel Of happiness" },
  { nameReal : "Andy-Rew", nameGod : "Lord Wensleydale" },
  { nameReal : "Kush", nameGod : "the hokey dokey" },
  { nameReal : "Pink", nameGod : "Hathena" },
  { nameReal : "Jaime", nameGod : "The Desheather" },
];
var req;
function getProfile ( g )
{
  return $.get( "god.php", { g: g } ).done(function(data) { a = data; });
}

var pages = [];
var data = {};
data.time = Date.now();
data.timePretty = new Date().toGMTString();
data.gods = [];

var day = 1, week = 7, month = 31, year = 365;
var ten = 10, dozen = 12, hundred = 100, thousand = 1000, million = 1000000, billion = 1000000000
var temp;
// var index = 0;
var ajax;
var scope;
var count = 0;
God = function( g )
{
  var god = g.nameGod;
  // httpget = $.get( "god.php", { g: godnames[0].nameGod } );
  $.get( "god.php", { g: g }, function( x ){
    scope = this;
    this.nameGod = $( "#god h2", x )[0].innerHTML.toString().trim();
    this.nameHero = $( "#essential_info h3", x )[0].innerHTML.trim();
    this.level = parseInt( $( ".level", x )[0].innerHTML.trim().replace( "level ", "" ) );
    this.motto = $( ".motto", x )[0].innerHTML.trim();
    this.gender = $( "td.label:contains('Gender')", x ).parent().children()[1].innerHTML.trim();
    this.ageStr = $( "td.label:contains('Age')", x ).parent().children()[1].innerHTML.trim();
    this.personality = $( "td.label:contains('Personality')", x ).parent().children()[1].innerHTML.trim();
    this.guildName = $( ".name.guild a", x )[0].innerHTML.trim();
    this.guildRank = $( ".guild_status", x )[0].innerHTML.replace( "(", "" ).replace( ")", "" ).trim();
    this.goldStr = $( "td.label:contains('Gold')", x ).parent().children()[1].innerHTML.trim();
      this.goldNum = eval( "0 " + this.goldStr.replace( "about ", "" ).replace( /[1-9]/g, '+ ' + '$&' + ' * ' ) )
    this.killedStr = $( "td.label:contains('Monsters Killed')", x ).parent().children()[1].innerHTML.trim();
      this.killedNum = eval( "0 " + this.killedStr.replace( "about ", "" ).replace( /[1-9]/g, '+ ' + '$&' + ' * ' ) )
    this.deaths = parseInt( $( "td.label:contains('Death Count')", x ).parent().children()[1].innerHTML.trim() );
    this.wins = parseInt( $( "td.label:contains('Wins / Losses')", x ).parent().children()[1].innerHTML.trim().replace( / \/ [0-9]*/g, "" ) );
    this.loses = parseInt( $( "td.label:contains('Wins / Losses')", x ).parent().children()[1].innerHTML.trim().replace( /[0-9]* \/ /g, "" ) );
    this.bricks = parseInt( $( "td.label:contains('Bricks for Temple')", x ).parent().children()[1].innerHTML.replace( ".", "" ) );
    // this.pet = $( "td.label:contains('Pet')", x ).parent().children()[1].innerHTML.trim();
    this.equipment = [];
    $( "#column_2 tr", x ).each(function( index ) {
      scope.equipment.push({
        label : $( this ).children()[0].innerHTML,
        name : $( this ).children()[1].innerHTML,
        value : parseInt( $( this ).children()[2].innerHTML.replace( "+", "" ) )
      });
    });
    this.skills = [];
    $( "#column_2 .b_list li", x ).each(function( index ) {
      skill = $( this ).text().toString();
      scope.skills.push ({
       name : skill.substring( 0 , skill.indexOf( "level" ) ),
       level : parseInt( skill.substring( skill.indexOf( "level" ) + 6 ) )
      })
    });
    this.pantheons = [];
    $( "#column_3 tr", x ).each(function( index ) {
      item = $( this );
      if ( $( this ).children()[0].innerHTML !== '<div class="panth_div"></div>' ) {
        scope.pantheons.push({
          name : $( item ).children()[0].innerHTML,
          rank : $( item ).children()[1].innerHTML
        });
      }
    });
    this.achievements = [];
    $( "#column_3 .b_list li", x ).each(function( index ) {
      scope.achievements.push ({
        name : $( this ).text().toString().substring( 0, $( this ).text().toString().indexOf( "," ) ),
        rank : parseInt( $( this ).text().toString().substring($( this ).text().toString().indexOf( "," ) + 1) ),
        about : this.getAttribute( "title" )
      });
    });
  }.bind(this));
  count++;
}

godnames.forEach( function(x){
  console.log( "urls.forEach: " + 'http://themork.co.uk/gods/god.php?g=' + x.nameGod );
  data.gods.push( new God ( x.nameGod ) );
});
console.log( "data: " + data );
function wait(){
  if (!data.gods[godnames.length-1].nameHero){
    setTimeout(wait,100);
  } else {
    $("#output").append(JSON.stringify(data));
    $( "#output" ).each( function ( i, block )
    { hljs.highlightBlock ( block ); });
  }
}
