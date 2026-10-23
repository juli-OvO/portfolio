/* Braindump prompts. Two layers per project:
   scan  = what a recruiter/HR reader takes in 10 seconds (short, factual)
   depth = what a designer reads for judgment (long, messy, unedited)
   tag: 'hr' | 'des' | 'both'    type: text | long | list | img */
window.BRAINDUMP_SCHEMA = {
  projects: [
    {id:'hellorsell', title:'Hell or Sell', meta:'2026 · Code · no page built yet'},
    {id:'headsup',    title:'Heads Up Website Redesign', meta:'2026 · Code'},
    {id:'orbit',      title:'Orbit of Desire', meta:'2025 · Game design'},
    {id:'boids',      title:'Boid Sequencer', meta:'2025 · Computational'},
    {id:'magnetoreception', title:'Magnetoreception', meta:'2026 · Physical computation · wearable wing'},
    {id:'window',     title:'Prosthetic Window', meta:'2026 · Physical computation · responsive bioplastic window'},
    {id:'illustration',title:'Illustration', meta:'2023–26 · Fine art'},
    {id:'drawings',   title:'Drawings', meta:'2023–26 · Fine art'}
  ],
  /* asked of every project */
  blocks: [
    {id:'scan', title:'Scan layer', note:'A recruiter reads only this. Short, factual, no craft required — I will turn it into the case-page header.', fields:[
      {id:'oneline', tag:'hr', type:'text', label:'In one sentence, what is it?', hint:'Plain language. No adjectives you would not say out loud.'},
      {id:'role', tag:'hr', type:'text', label:'What was your role?', hint:'Be specific about what YOU did vs the team'},
      {id:'team', tag:'hr', type:'text', label:'Who else was involved?', hint:'Team size, your collaborators, who you reported to'},
      {id:'when', tag:'hr', type:'text', label:'When, and for how long?'},
      {id:'context', tag:'hr', type:'text', label:'Class, client, job, or self-directed?'},
      {id:'tools', tag:'hr', type:'list', label:'Tools and skills used'},
      {id:'outcome', tag:'hr', type:'long', label:'What came of it?', hint:'Shipped? Used by whom? Numbers if you have them, honest "nothing yet" if not.'}
    ]},
    {id:'story', title:'Depth layer — the story', note:'Dump. Grammar does not matter, order does not matter, length does not matter. This is where the actual case study comes from.', fields:[
      {id:'problem', tag:'des', type:'long', label:'What was actually wrong, or what pulled you in?', hint:'The real reason it existed. Not the brief as written — the situation.'},
      {id:'process', tag:'des', type:'long', label:'Walk me through what you did, in order', hint:'Include the parts that went nowhere. Dead ends are the most interesting part of a portfolio.'},
      {id:'decisions', tag:'des', type:'long', label:'What did you decide, and why?', hint:'The single most-read part of a case page. Each choice: what the options were, what you picked, what it cost.'},
      {id:'changed', tag:'des', type:'long', label:'What broke, or changed your mind?', hint:'Feedback that stung, a test that failed, a constraint you found late'},
      {id:'craft', tag:'des', type:'long', label:'The craft — what are you proud of at close range?', hint:'A detail, a piece of code, a typographic call, an interaction nobody notices'},
      {id:'redo', tag:'des', type:'long', label:'What would you redo?'}
    ]},
    {id:'show', title:'What to show', note:'Point me at the artifacts. Drop what you have; note what you would need to remake.', fields:[
      {id:'hero', tag:'both', type:'img', label:'The one image that carries the project'},
      {id:'a1', tag:'des', type:'img', label:'Process artifact 1'},
      {id:'a2', tag:'des', type:'img', label:'Process artifact 2'},
      {id:'a3', tag:'des', type:'img', label:'Process artifact 3'},
      {id:'missing', tag:'des', type:'list', label:'Things worth showing that do not exist yet', hint:'Diagrams, before/afters, a screen recording — I can build these'},
      {id:'links', tag:'both', type:'list', label:'Links', hint:'Live site, repo, video, Figma, writeup'}
    ]},
    {id:'loose', title:'Loose ends', note:null, fields:[
      {id:'notes', tag:'both', type:'long', label:'Anything else in your head about this project', hint:'Half-thoughts welcome'},
      {id:'worry', tag:'both', type:'text', label:'What are you unsure about showing?'}
    ]}
  ],
  /* asked once */
  about: [
    {id:'aim', title:'What this portfolio is for', note:'Sets the whole tone. Answer honestly — it changes how I structure every page.', fields:[
      {id:'target', tag:'hr', type:'long', label:'Who are you sending this to, specifically?', hint:'Company types, roles, named places if you know them'},
      {id:'jobs', tag:'hr', type:'list', label:'What titles are you applying for?'},
      {id:'read', tag:'hr', type:'text', label:'If they remember one thing about you, what should it be?'},
      {id:'strong', tag:'both', type:'long', label:'Which project is your strongest, and why?'},
      {id:'weak', tag:'both', type:'text', label:'Which one are you least sure belongs?'},
      {id:'order', tag:'hr', type:'list', label:'Ideal order on the index', hint:'Best first. Reviewers rarely reach number four.'}
    ]},
    {id:'you', title:'You', note:null, fields:[
      {id:'bio', tag:'both', type:'long', label:'Who you are, in your own words', hint:'Unedited. I will write the polished version from it.'},
      {id:'thread', tag:'des', type:'long', label:'What connects your work?', hint:'Fine art, code, and game design in one portfolio — what is the through-line?'},
      {id:'edu', tag:'hr', type:'list', label:'Education', hint:'School — degree — years'},
      {id:'exp', tag:'hr', type:'list', label:'Experience', hint:'Org — role — years'},
      {id:'skills', tag:'hr', type:'list', label:'Skills'},
      {id:'extra', tag:'hr', type:'list', label:'Awards, exhibitions, publications'},
      {id:'portrait', tag:'both', type:'img', label:'Portrait'}
    ]},
    {id:'ask', title:'Questions for me', note:null, fields:[
      {id:'q', tag:'both', type:'long', label:'What do you want my opinion on?'}
    ]}
  ]
};
