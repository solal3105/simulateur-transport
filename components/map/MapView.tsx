'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { PROJECTS } from '@/lib/data'
import { PROJECT_GEO_DATA, SELECTION_COLORS } from '@/lib/projectsGeo'
import { Project, MandatPeriod } from '@/lib/types'
import { ProjectDetailPanel } from './ProjectDetailPanel'
import { MapDashboard } from './MapDashboard'
import { ProjectTooltip } from './ProjectTooltip'
import { useTheme } from '@/contexts/ThemeContext'
import 'leaflet/dist/leaflet.css'

// Lyon center coordinates
const LYON_CENTER: [number, number] = [45.7578, 4.8320]
const DEFAULT_ZOOM = 12

// Custom marker icon creation
function createMarkerIcon(color: string, isSelected: boolean, projectType: string): L.DivIcon {
  const size = isSelected ? 36 : 28
  const borderColor = isSelected ? '#ffffff' : 'transparent'
  const borderWidth = isSelected ? 3 : 0
  const shadowClass = isSelected ? 'shadow-lg' : ''
  
  const typeEmoji = {
    metro: '🚇',
    tram: '🚊',
    bus: '🚌',
    other: '🚢',
  }[projectType] || '📍'

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: ${borderWidth}px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.45}px;
        box-shadow: ${isSelected ? '0 4px 15px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.2)'};
        transition: all 0.3s ease;
        cursor: pointer;
      ">
        ${typeEmoji}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function getMarkerColor(period: MandatPeriod): string {
  if (!period) return SELECTION_COLORS.none
  return SELECTION_COLORS[period]
}

interface ProjectMarkerProps {
  project: Project
  geoData: typeof PROJECT_GEO_DATA[string]
  selectedPeriod: MandatPeriod
  onClick: () => void
  onHover: (project: Project | null) => void
  isActive: boolean
}

function ProjectMarker({ project, geoData, selectedPeriod, onClick, onHover, isActive }: ProjectMarkerProps) {
  const color = getMarkerColor(selectedPeriod)
  const icon = createMarkerIcon(color, isActive || selectedPeriod !== null, geoData.type)
  const [geojsonData, setGeojsonData] = useState<GeoJSON.GeoJsonObject | null>(null)
  const [hasGeojson, setHasGeojson] = useState(false)

  // Try to load GeoJSON file if it exists
  useEffect(() => {
    if (geoData.geojsonFile) {
      fetch(`/geojson/${geoData.geojsonFile}`)
        .then(res => {
          if (res.ok) return res.json()
          throw new Error('Not found')
        })
        .then(data => {
          setGeojsonData(data)
          setHasGeojson(true)
        })
        .catch(() => {
          setHasGeojson(false)
        })
    }
  }, [geoData.geojsonFile])

  // Determine line style based on selection state
  const getLineStyle = () => {
    const isSelected = selectedPeriod !== null
    const baseWeight = isActive ? 10 : isSelected ? 7 : 5
    const baseOpacity = isActive ? 1 : isSelected ? 0.95 : 0.7
    
    // Unselected lines: subtle but visible with soft color
    const lineColor = isActive ? '#ffffff' : isSelected ? color : '#94a3b8'
    
    return {
      color: lineColor,
      weight: baseWeight,
      opacity: baseOpacity,
      fillColor: color,
      fillOpacity: isSelected ? 0.3 : 0.05,
      lineCap: 'round' as const,
      lineJoin: 'round' as const,
      dashArray: isSelected ? undefined : '8, 6',
      className: `geojson-line ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`,
    }
  }

  // If GeoJSON exists, render it instead of marker
  if (hasGeojson && geojsonData) {
    return (
      <>
        {/* Invisible thick trace for easier clicking */}
        <GeoJSON
          key={`${project.id}-hitbox-${selectedPeriod}-${isActive}`}
          data={geojsonData}
          style={() => ({
            color: 'transparent',
            weight: 30,
            opacity: 0,
            fillOpacity: 0,
          })}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e)
              onClick()
            },
            mouseover: () => onHover(project),
            mouseout: () => onHover(null),
          }}
        />
        {/* Glow effect for selected lines */}
        {(selectedPeriod || isActive) && (
          <GeoJSON
            key={`${project.id}-glow-${selectedPeriod}-${isActive}`}
            data={geojsonData}
            style={() => ({
              color: color,
              weight: isActive ? 20 : 16,
              opacity: 0.3,
              fillOpacity: 0,
            })}
          />
        )}
        <GeoJSON
          key={`${project.id}-${selectedPeriod}-${isActive}`}
          data={geojsonData}
          style={getLineStyle}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e)
              onClick()
            },
            mouseover: (e) => {
              const layer = e.target
              layer.setStyle({
                weight: isActive ? 12 : 10,
                opacity: 1,
              })
              onHover(project)
            },
            mouseout: (e) => {
              const layer = e.target
              layer.setStyle(getLineStyle())
              onHover(null)
            },
          }}
        />
      </>
    )
  }

  return (
    <Marker
      position={geoData.coordinates}
      icon={icon}
      eventHandlers={{
        click: onClick,
        mouseover: () => onHover(project),
        mouseout: () => onHover(null),
      }}
    />
  )
}

// Component to handle map events
function MapEventHandler({ onMapClick }: { onMapClick: () => void }) {
  const map = useMap()
  
  useEffect(() => {
    map.on('click', (e) => {
      // Check if click was on a marker
      const target = e.originalEvent.target as HTMLElement
      if (!target.closest('.custom-marker')) {
        onMapClick()
      }
    })
  }, [map, onMapClick])

  return null
}

// Map tile providers
const MAP_STYLES = {
  light: {
    name: 'Clair',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    name: 'Sombre',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
  streets: {
    name: 'Classique',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
}

export type MapStyleKey = keyof typeof MAP_STYLES

export function MapView() {
  const { projectSelections, setProjectPeriod, setProjectUpgrade, setProjectUpgradeOption } = useGameStore()
  const { resolvedTheme } = useTheme()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showFinancing, setShowFinancing] = useState(false)
  const [showBusOffer, setShowBusOffer] = useState(false)
  const [mapStyle, setMapStyle] = useState<MapStyleKey>(resolvedTheme === 'dark' ? 'dark' : 'light')

  // Sync map style with theme on initial load
  useEffect(() => {
    if (mapStyle === 'light' || mapStyle === 'dark') {
      setMapStyle(resolvedTheme === 'dark' ? 'dark' : 'light')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme])

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const currentMapStyle = MAP_STYLES[mapStyle]

  const handleProjectClick = (project: Project) => {
    // If clicking on already selected project, close and reopen to force refresh
    if (selectedProject?.id === project.id) {
      setSelectedProject(null)
      setTimeout(() => setSelectedProject(project), 0)
    } else {
      setSelectedProject(project)
    }
  }

  const handleMapClick = () => {
    setSelectedProject(null)
  }

  const handleSelectPeriod = (projectId: string, period: MandatPeriod) => {
    setProjectPeriod(projectId, period)
  }

  const getProjectSelection = (projectId: string): MandatPeriod => {
    const selection = projectSelections.find(s => s.projectId === projectId)
    return selection?.period || null
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Map Container */}
      <MapContainer
        center={LYON_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full z-0"
        style={{ background: 'var(--map-bg)' }}
        zoomControl={false}
      >
        <TileLayer
          key={mapStyle}
          attribution={currentMapStyle.attribution}
          url={currentMapStyle.url}
        />
        
        <MapEventHandler onMapClick={handleMapClick} />

        {/* Project Markers */}
        {PROJECTS.map((project) => {
          const geoData = PROJECT_GEO_DATA[project.id]
          if (!geoData) return null

          return (
            <ProjectMarker
              key={project.id}
              project={project}
              geoData={geoData}
              selectedPeriod={getProjectSelection(project.id)}
              onClick={() => handleProjectClick(project)}
              onHover={setHoveredProject}
              isActive={selectedProject?.id === project.id}
            />
          )
        })}
      </MapContainer>

      {/* Dashboard Overlay - Top */}
      <MapDashboard 
        onOpenFinancing={() => setShowFinancing(true)}
        showFinancing={showFinancing}
        onCloseFinancing={() => setShowFinancing(false)}
        onOpenBusOffer={() => setShowBusOffer(true)}
        showBusOffer={showBusOffer}
        onCloseBusOffer={() => setShowBusOffer(false)}
        mapStyle={mapStyle}
        onMapStyleChange={setMapStyle}
        mapStyles={MAP_STYLES}
      />


      {/* Project Detail Panel - Right Side */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailPanel
            project={selectedProject}
            selectedPeriod={getProjectSelection(selectedProject.id)}
            onSelectPeriod={(period: MandatPeriod) => handleSelectPeriod(selectedProject.id, period)}
            onClose={() => setSelectedProject(null)}
            isUpgraded={projectSelections.find(s => s.projectId === selectedProject.id)?.upgraded || false}
            onToggleUpgrade={(upgraded) => setProjectUpgrade(selectedProject.id, upgraded)}
            selectedUpgradeOptionId={projectSelections.find(s => s.projectId === selectedProject.id)?.selectedUpgradeOptionId}
            onSelectUpgradeOption={(optionId) => setProjectUpgradeOption(selectedProject.id, optionId)}
          />
        )}
      </AnimatePresence>

      {/* Project Tooltip on Hover */}
      <AnimatePresence>
        {hoveredProject && !selectedProject && (
          <ProjectTooltip
            project={hoveredProject}
            projectType={PROJECT_GEO_DATA[hoveredProject.id]?.type || 'other'}
            mousePosition={mousePosition}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
