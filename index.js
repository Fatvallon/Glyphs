const fs = require('fs')
const path = require('path')

module.exports = function glyphs(mod) {

  let glyphBuf = {unk: false, glyphs: []};
  let cache;
  let job = null;
  let jobs = ['Warrior', 'Lancer', 'Slayer', 'Berserker', 'Sorcerer', 'Archer', 'Priest', 'Mystic', 'Reaper', 'Gunner', 'Brawler', 'Ninja', 'Valkyrie'];

  mod.hook('S_CREST_INFO', 2, (event) => {
    glyphBuf.glyphs = [];
    for(let i of event.crests){
      if(!i.enable) continue;
      glyphBuf.glyphs.push({glyphId: i.id});
    }
  });

  mod.hook('S_CREST_APPLY', 2, (event) => {
    if(!event.enable){
      for(let i = 0; i < glyphBuf.glyphs.length; ++i){
        if(glyphBuf.glyphs[i].glyphId == event.id){
          glyphBuf.glyphs.splice(i--, 1);
        }
      }
      return;
    }
    glyphBuf.glyphs.push({glyphId: event.id});
  });

  mod.hook('S_LOGIN', 10, (event) => {
    job = (event.templateId - 10101) % 100;
  });

  mod.command.add('glyph', (cmd, arg1) => {
    switch(cmd){
      case 'save':
        fs.writeFile(path.join(__dirname, 'Glyphs', jobs[job], arg1+".json"), (JSON.stringify(glyphBuf, null, 4)), err => {
          if(err) {
            mod.command.message('Glyph: Glyph folder not found.');
            console.error(err);
            return;
          }
          mod.command.message('Glyph: ' + arg1 + ' saved.');
        });
        return;
      case 'load':
        fs.readFile(path.join(__dirname, 'Glyphs', jobs[job], arg1+".json"), function(err,data){
          if(err){
            mod.command.message('Glyph: File not found.');
            console.error(err);
            return;
          }
          cache = JSON.parse(data);
          mod.toServer('C_CREST_APPLY_LIST', 1, {unk: cache.unk, glyphs: cache.glyphs});
          mod.command.message('Glyph: ' + arg1 + ' loaded.');
        });
        return;
      case 'list':
        fs.readdir(path.join(__dirname, 'Glyphs', jobs[job]), (err, files) => {
          if(err){
            mod.command.message('Glyph: Glyph folder not found.');
            console.log(err); 
            return; 
          }
          mod.command.message(' Glyph List ----');
          for(let i = 0; i < files.length; ++i){
            mod.command.message(' ' + (i+1) + ': ' + (files[i].slice(0, -5)));
          }
        });
        return;
      case 'delete':
      fs.unlink(path.join(__dirname, 'Glyphs', arg1+".json"), err => {
        if(err){
          mod.command.message('Glyph: File not found.');
          console.error(err);
          return;
        }
        mod.command.message('Glyph: ' + arg1 + ' deleted.');
      });
      return;
      default: 
        mod.command.message('Glyph: Unknown Command.');
        return;
    }
  });
}
