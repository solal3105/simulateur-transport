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
  isActive: boolean
}

function ProjectMarker({ project, geoData, selectedPeriod, onClick, isActive }: ProjectMarkerProps) {
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
    const baseWeight = isActive ? 10 : isSelected ? 8 : 6
    const baseOpacity = isActive ? 1 : isSelected ? 0.9 : 0.6
    
    return {
      color: isActive ? '#ffffff' : color,
      weight: baseWeight,
      opacity: baseOpacity,
      fillColor: color,
      fillOpacity: isSelected ? 0.3 : 0.1,
      lineCap: 'round' as const,
      lineJoin: 'round' as const,
      dashArray: isSelected ? undefined : '5, 10',
      className: `geojson-line ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`,
    }
  }

  // If GeoJSON exists, render it instead of marker
  if (hasGeojson && geojsonData) {
    return (
      <>
        {/* Glow effect for selected lines */}
        {(selectedPeriod || isActive) && (
          <GeoJSON
            key={`${project.id}-glow`}
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
          key={project.id}
          data={geojsonData}
          style={getLineStyle}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e)
              onClick()
            },
            mouseover: (e) => {
              // Apply hover effect on all lines
              const layer = e.target
              layer.setStyle({
                weight: isActive ? 12 : 10,
                opacity: 1,
              })
            },
            mouseout: (e) => {
              const layer = e.target
              layer.setStyle(getLineStyle())
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

export function MapView() {
  const { projectSelections, setProjectPeriod } = useGameStore()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showFinancing, setShowFinancing] = useState(false)

  const handleProjectClick = (project: Project) => {
    // Always open the panel, even if project is already selected (allows deselection)
    setSelectedProject(project)
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
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Map Container */}
      <MapContainer
        center={LYON_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full z-0"
        style={{ background: '#1a1a2e' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
      />


      {/* Project Detail Panel - Right Side */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailPanel
            project={selectedProject}
            selectedPeriod={getProjectSelection(selectedProject.id)}
            onSelectPeriod={(period: MandatPeriod) => handleSelectPeriod(selectedProject.id, period)}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
