import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Search, Users, Compass, Star, UserRound, Settings2, ChevronLeft, ChevronRight, X, Heart, MessageCircle, Sparkles, Film, Radio, MoveUpRight } from 'lucide-react'
import './style.css'

const initialMovies = [
  {id:1,title:'Dune: Part Two',year:2024,genre:'Sci-Fi',rating:8.8,votes:'2.1k',color:'sand',emoji:'🏜️',desc:'A mythic journey across Arrakis, where destiny, power and survival collide.',tag:'TRENDING'},
  {id:2,title:'Spider-Man: Across the Spider-Verse',year:2023,genre:'Animation',rating:8.6,votes:'1.8k',color:'pink',emoji:'🕸️',desc:'Miles Morales swings into a multiverse of possibilities.',tag:'COMMUNITY PICK'},
  {id:3,title:'The Batman',year:2022,genre:'Action',rating:7.8,votes:'940',color:'blue',emoji:'🦇',desc:'A dark detective story through the rain-soaked streets of Gotham.',tag:'NIGHT WATCH'},
  {id:4,title:'Interstellar',year:2014,genre:'Sci-Fi',rating:8.7,votes:'3.4k',color:'violet',emoji:'🪐',desc:'A team travels beyond this galaxy to secure humanity’s future.',tag:'TIMELESS'},
  {id:5,title:'Everything Everywhere All at Once',year:2022,genre:'Adventure',rating:7.8,votes:'1.2k',color:'orange',emoji:'🌈',desc:'An ordinary life opens into an extraordinary multiverse.',tag:'WILD CARD'},
  {id:6,title:'The Grand Budapest Hotel',year:2014,genre:'Comedy',rating:8.1,votes:'860',color:'rose',emoji:'🏨',desc:'A legendary concierge and his lobby boy become unlikely partners.',tag:'FEEL GOOD'},
  {id:7,title:'Get Out',year:2017,genre:'Horror',rating:7.8,votes:'1.5k',color:'green',emoji:'🌲',desc:'A weekend visit turns into a chilling psychological mystery.',tag:'SPOOKY'},
  {id:8,title:'La La Land',year:2016,genre:'Romance',rating:8.0,votes:'1.1k',color:'gold',emoji:'🌆',desc:'Two dreamers chase ambition and love in Los Angeles.',tag:'DATE NIGHT'},
  {id:9,title:'Top Gun: Maverick',year:2022,genre:'Action',rating:8.2,votes:'1.7k',color:'steel',emoji:'✈️',desc:'A new generation takes flight under a legendary pilot.',tag:'HIGH ENERGY'}
]
const zones = [
  {id:'trending',name:'Trending Universe',sub:'The movies everyone is talking about',icon:'✦',genre:'All'},
  {id:'discover',name:'Discover Universe',sub:'Find your next favourite story',icon:'◈',genre:'Discover'},
  {id:'community',name:'Community Universe',sub:'Picks from people in your orbit',icon:'◎',genre:'Community'}
]
const friends = [{name:'Mila',status:'Exploring Sci-Fi',initial:'M',color:'lavender'},{name:'Alex',status:'In the lobby',initial:'A',color:'mint'},{name:'Noah',status:'Watching the trending list',initial:'N',color:'peach'}]

function App(){
  const [movies,setMovies]=useState(initialMovies)
  const [zone,setZone]=useState('trending')
  const [search,setSearch]=useState('')
  const [selected,setSelected]=useState(null)
  const [profileOpen,setProfileOpen]=useState(false)
  const [name,setName]=useState('Hämi')
  const [skin,setSkin]=useState('violet')
  const [avatar,setAvatar]=useState('🧑🏽‍🚀')
  const [position,setPosition]=useState({x:50,y:78})
  const [myRatings,setMyRatings]=useState({})
  const [review,setReview]=useState('')
  const [toast,setToast]=useState('')
  const [friendsOpen,setFriendsOpen]=useState(true)
  const [activeGenre,setActiveGenre]=useState('All')
  const [joined,setJoined]=useState(false)

  useEffect(()=>{
    const handle=(e)=>{
      const key=e.key.toLowerCase()
      const moves={w:[0,-3],arrowup:[0,-3],s:[0,3],arrowdown:[0,3],a:[-3,0],arrowleft:[-3,0],d:[3,0],arrowright:[3,0]}
      if(moves[key]){
        e.preventDefault()
        const [dx,dy]=moves[key]
        setPosition(p=>({x:Math.max(8,Math.min(92,p.x+dx)),y:Math.max(18,Math.min(88,p.y+dy))}))
      }
      if(key==='escape')setSelected(null)
    }
    window.addEventListener('keydown',handle)
    return ()=>window.removeEventListener('keydown',handle)
  },[])
  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),2300);return ()=>clearTimeout(t)}},[toast])

  const filtered=useMemo(()=>movies.filter(m=>{
    const matches=(m.title+' '+m.genre).toLowerCase().includes(search.toLowerCase())
    const genre=activeGenre==='All'||activeGenre==='Discover'||activeGenre==='Community'||m.genre===activeGenre
    return matches&&genre
  }),[movies,search,activeGenre])
  const visible=zone==='community'?[...filtered].sort((a,b)=>b.rating-a.rating).slice(0,6):zone==='discover'?[...filtered].reverse().slice(0,6):filtered.slice(0,6)
  const currentZone=zones.find(z=>z.id===zone)

  function rate(id,value){setMyRatings(r=>({...r,[id]:value}));setToast('Your rating has been saved locally')}
  function saveReview(){if(!review.trim())return;setToast('Review posted to the demo community');setReview('')}
  function switchZone(id){setZone(id);setActiveGenre('All');setPosition({x:50,y:78})}

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Film size={20}/></div><span>MOVIE<span className="brand-accent">VERSE</span></span></div>
      <div className="side-label">YOUR UNIVERSE</div>
      <button className="side-link active"><Compass size={17}/> Explore <span className="live-dot"/></button>
      <button className="side-link" onClick={()=>setZone('community')}><Users size={17}/> Communities</button>
      <button className="side-link" onClick={()=>setToast('Your watchlist is coming soon')}><Heart size={17}/> Watchlist</button>
      <div className="side-label zone-label">DISCOVERY ZONES</div>
      {zones.map(z=><button key={z.id} className={'zone-link '+(zone===z.id?'selected':'')} onClick={()=>switchZone(z.id)}><span>{z.icon}</span>{z.name.replace(' Universe','')}</button>)}
      <div className="sidebar-bottom">
        <div className="mini-card"><Sparkles size={16}/><b>Your world, your rules.</b><p>Find people who love the same stories.</p><button onClick={()=>setProfileOpen(true)}>Personalize <MoveUpRight size={13}/></button></div>
        <button className="profile-mini" onClick={()=>setProfileOpen(true)}><div className="avatar-small">{avatar}</div><span><b>{name}</b><small>Explorer · Level 01</small></span><Settings2 size={16}/></button>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div className="breadcrumb">THE MULTIVERSE <span>/</span> <b>{currentZone.name.toUpperCase()}</b></div>
        <div className="top-actions"><div className="online-pill"><i/> 24 explorers online</div><button className="icon-button" onClick={()=>setFriendsOpen(v=>!v)}><Users size={18}/><span className="tiny-count">3</span></button><button className="user-chip" onClick={()=>setProfileOpen(true)}><span>{avatar}</span>{name}</button></div>
      </header>

      <section className="welcome">
        <div><div className="eyebrow"><span className="eyebrow-line"/> YOUR PERSONAL CINEMA DIMENSION</div><h1>Explore beyond<br/><em>the screen.</em></h1><p>Discover stories, meet your people, and find your next obsession.</p></div>
        <div className="welcome-orb"><div className="orb-core">MV</div><span className="orbit orbit-one"/><span className="orbit orbit-two"/><span className="orb-star star-one">✦</span><span className="orb-star star-two">✧</span></div>
      </section>

      <section className="search-row">
        <div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search movies, genres, universes..."/><kbd>⌘ K</kbd></div>
        <button className="filter-button" onClick={()=>setActiveGenre(activeGenre==='All'?'Sci-Fi':'All')}>◉ {activeGenre==='All'?'Filters':'Sci-Fi active'}</button>
      </section>
      <div className="genre-row">{['All','Sci-Fi','Action','Animation','Horror','Comedy','Romance'].map(g=><button key={g} onClick={()=>setActiveGenre(g)} className={activeGenre===g?'genre active-genre':'genre'}>{g}</button>)}</div>

      <section className="world-section">
        <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> ZONE 0{zones.findIndex(z=>z.id===zone)+1}</div><h2>{currentZone.name}</h2><p>{currentZone.sub}</p></div><div className="zone-arrows"><button onClick={()=>switchZone(zones[(zones.findIndex(z=>z.id===zone)+2)%3].id)}><ChevronLeft size={17}/></button><button onClick={()=>switchZone(zones[(zones.findIndex(z=>z.id===zone)+1)%3].id)}><ChevronRight size={17}/></button></div></div>

        <div className="world-stage">
          <div className="stage-grid"/>
          <div className="stage-glow glow-a"/><div className="stage-glow glow-b"/>
          <div className="stage-label"><span className="pulse"/> LIVE WORLD <span>·</span> {currentZone.name.toUpperCase()}</div>
          <div className="floating-cube cube-a"/><div className="floating-cube cube-b"/>
          <div className="movie-platforms">
            {visible.slice(0,3).map((m,i)=><button className={'movie-pedestal pedestal-'+i} key={m.id} onClick={()=>setSelected(m)}>
              <div className={'poster poster-'+m.color}><span className="poster-tag">{m.tag}</span><span className="poster-emoji">{m.emoji}</span><b>{m.title}</b><small>{m.year} · {m.genre}</small><span className="poster-rating"><Star size={12} fill="currentColor"/>{m.rating}</span></div><div className="pedestal-base"/><span className="pedestal-hint">OPEN FILM ↗</span>
            </button>)}
          </div>
          <div className="player-character" style={{left:position.x+'%',top:position.y+'%'}}><div className="player-bubble">{name}</div><div className={'player-avatar skin-'+skin}>{avatar}</div><span className="player-shadow"/></div>
          <div className="stage-controls"><span>MOVE AROUND</span><kbd>W</kbd><div><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div><small>or arrow keys</small></div>
          <div className="stage-caption">A SOCIAL SPACE FOR MOVIE LOVERS</div>
        </div>
        <div className="stage-footer"><span><i/> You are exploring as <b>{name}</b></span><span>Click a movie to explore <MoveUpRight size={13}/></span></div>
      </section>

      <section className="catalog-section">
        <div className="section-heading compact"><div><div className="eyebrow"><span className="eyebrow-line"/> CURATED FOR YOU</div><h2>More to explore</h2></div><button className="text-link" onClick={()=>setToast('Full catalogue coming soon')}>View all <MoveUpRight size={14}/></button></div>
        <div className="movie-grid">{visible.slice(0,6).map(m=><button className="catalog-card" key={m.id} onClick={()=>setSelected(m)}><div className={'catalog-art poster-'+m.color}><span>{m.emoji}</span><small>{m.tag}</small></div><div className="catalog-info"><b>{m.title}</b><small>{m.year} · {m.genre}</small><span><Star size={12} fill="currentColor"/>{m.rating} <i>· {m.votes} ratings</i></span></div></button>)}</div>
        {visible.length===0&&<div className="empty-state">No movies found in this universe. Try another search.</div>}
      </section>
      <footer>© 2026 MOVIEVERSE <span>BUILT FOR EXPLORERS, BY EXPLORERS</span></footer>
    </main>

    {friendsOpen&&<aside className="friends-panel"><div className="friends-head"><div><div className="eyebrow">YOUR ORBIT</div><h3>Friends <span>03</span></h3></div><button className="icon-button" onClick={()=>setFriendsOpen(false)}><X size={16}/></button></div><button className="invite-button" onClick={()=>setToast('Invite link copied (demo)')}><span>＋</span> Invite friends</button><div className="friend-list">{friends.map(f=><div className="friend" key={f.name}><div className={'friend-avatar '+f.color}>{f.initial}</div><div><b>{f.name}</b><small>{f.status}</small></div><i/></div>)}</div><div className="room-card"><div className="room-art">✦</div><div><span className="eyebrow">FRIEND ROOM</span><b>Friday Film Club</b><small>2 / 6 explorers inside</small></div><button onClick={()=>{setJoined(!joined);setToast(joined?'You left the room':'You joined Friday Film Club')}}>{joined?'Leave':'Join'} <MoveUpRight size={12}/></button></div><div className="activity"><div className="eyebrow">RECENT ACTIVITY</div><p><span className="activity-dot"/> <b>Mila</b> rated <b>Dune: Part Two</b></p><small>12 minutes ago</small><p><span className="activity-dot purple"/> <b>Alex</b> joined the universe</p><small>34 minutes ago</small></div><div className="friends-note"><Radio size={14}/> Friends presence is simulated in this demo.</div></aside>}

    {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="movie-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelected(null)}><X size={18}/></button><div className={'modal-art poster-'+selected.color}><span>{selected.emoji}</span><small>{selected.tag}</small></div><div className="modal-content"><div className="eyebrow">MOVIE DETAIL · {selected.genre.toUpperCase()}</div><h2>{selected.title}</h2><p className="modal-meta">{selected.year} <span>·</span> {selected.genre} <span>·</span> <Star size={14} fill="currentColor"/> {selected.rating} <small>({selected.votes})</small></p><p className="movie-desc">{selected.desc}</p><div className="rate-block"><b>YOUR RATING</b><div className="stars">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>rate(selected.id,n)} className={n<=(myRatings[selected.id]||0)?'rated':''}><Star size={24} fill="currentColor"/></button>)}</div><small>{myRatings[selected.id]?`You rated this ${myRatings[selected.id]} / 5`:'Tap a star to rate this movie'}</small></div><div className="review-block"><label>ADD TO THE CONVERSATION</label><textarea value={review} onChange={e=>setReview(e.target.value)} placeholder="What did you think of this movie?"/><button className="primary-button" onClick={saveReview}>Post review <MessageCircle size={14}/></button></div></div></div></div>}

    {profileOpen&&<div className="modal-backdrop" onClick={()=>setProfileOpen(false)}><div className="profile-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setProfileOpen(false)}><X size={18}/></button><div className="eyebrow">YOUR IDENTITY</div><h2>Make it yours.</h2><div className="avatar-preview"><div className={'player-avatar skin-'+skin}>{avatar}</div><span>{name}</span></div><label>DISPLAY NAME</label><input className="profile-input" value={name} onChange={e=>setName(e.target.value.slice(0,18))}/><label>CHOOSE YOUR AVATAR</label><div className="avatar-options">{['🧑🏽‍🚀','👩🏻‍🚀','🧑🏿‍🎤','🧑🏼‍🎨','🦊','🤖'].map(a=><button className={avatar===a?'chosen':''} onClick={()=>setAvatar(a)}>{a}</button>)}</div><label>SKIN / GLOW</label><div className="skin-options">{['violet','blue','mint','rose','gold'].map(s=><button className={'skin-dot skin-'+s+(skin===s?' chosen':'')} onClick={()=>setSkin(s)}/>)}</div><button className="primary-button save-profile" onClick={()=>{setProfileOpen(false);setToast('Your explorer profile was updated')}}>Save appearance <Sparkles size={15}/></button></div></div>}
    {toast&&<div className="toast"><Sparkles size={15}/>{toast}</div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App/>)
