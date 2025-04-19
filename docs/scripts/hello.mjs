document.getElementById("testButton").onclick = function(evt) {
  const p = document.createElement("p");
  p.append("This is a new paragraph from clicking the button.  Boring.");
  evt.target.after(p);
}
