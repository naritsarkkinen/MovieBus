import { useState } from 'react'

// which map you are on (hub / clubs), which zone is active,
// and whether the card stack of a place is open
export default function useWorldNavigation({ onStudio, onRoom, onZoneSwitch }) {
  const [zone, setZone] = useState('trending')
  const [mapId, setMapId] = useState('hub')
  const [placeOpen, setPlaceOpen] = useState(false)

  function goToMap(id) {
    setMapId(id)
    setZone(id)
  }

  function openPlace(id) {
    setZone(id)
    setPlaceOpen(true)
  }

  // places that do something else than open a card stack
  const specialPlaces = {
    hub: () => goToMap('hub'),
    clubs: () => goToMap('clubs'),
    studio: onStudio,
    room: onRoom,
  }

  // called by the world: id = place you stepped on (null = off)
  function enterPlace(id) {
    if (!id) return
    const action = specialPlaces[id] || (() => openPlace(id))
    action()
  }

  // zone buttons in the HUD
  function switchZone(id) {
    onZoneSwitch()
    setPlaceOpen(false)
    if (id === 'clubs') {
      goToMap('clubs')
      return
    }
    setMapId('hub')
    openPlace(id)
  }

  return {
    zone,
    mapId,
    placeOpen,
    closePlace: () => setPlaceOpen(false),
    enterPlace,
    switchZone,
  }
}
