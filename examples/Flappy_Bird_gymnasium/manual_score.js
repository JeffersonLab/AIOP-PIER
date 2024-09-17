const player_token = playerToken

manual_score=myScore
console.log("manually entered score="+manual_score)
if (manual_score != null)
{
var xhr = new XMLHttpRequest();
xhr.open("POST", "https://epsciweb.jlab.org/msaiworkshop/AIOP-PIER/examples/Flappy_Bird_gymnasium/recordscore.php", true);
xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//console.log("player_token="+player_token+"&score="+this.score+"&method=ai");
xhr.send("player_token="+player_token+"&score="+manual_score+"&method=manual");
}
