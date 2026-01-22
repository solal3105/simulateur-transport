'use client'

import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip } from 'react-leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { PROJECT_GEO_DATA, PROJECT_TYPE_COLORS } from '@/lib/projectsGeo'
import { PROJECTS } from '@/lib/data'

interface ResultsMapProps {
  projectIds: string[]
}

export default function ResultsMap({ projectIds }: ResultsMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<Record<string, any>>({})

  useEffect(() => {
    const loadGeoJson = async () => {
      const data: Record<string, any> = {}
      
      for (const projectId of projectIds) {
        const geoData = PROJECT_GEO_DATA[projectId]
        if (geoData?.geojsonFile) {
          try {
            const response = await fetch(`/geojson/${geoData.geojsonFile}`)
            if (response.ok) {
              data[projectId] = await response.json()
            }
          } catch (error) {
            console.error(`Error loading GeoJSON for ${projectId}:`, error)
          }
        }
      }
      
      setGeoJsonData(data)
    }

    loadGeoJson()
  }, [projectIds])

  const getProjectColor = (projectId: string) => {
    const geoData = PROJECT_GEO_DATA[projectId]
    if (!geoData) return '#A855F7'
    return PROJECT_TYPE_COLORS[geoData.type as keyof typeof PROJECT_TYPE_COLORS] || '#A855F7'
  }

  const getProjectName = (projectId: string) => {
    const project = PROJECTS.find(p => p.id === projectId)
    return project?.name || projectId
  }

  return (
    <MapContainer
      center={[45.76, 4.85]}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {projectIds.map(projectId => {
        const geoData = PROJECT_GEO_DATA[projectId]
        const color = getProjectColor(projectId)
        const geojson = geoJsonData[projectId]

        return (
          <div key={projectId}>
            {geojson && (
              <GeoJSON
                data={geojson}
                style={{
                  color: color,
                  weight: 4,
                  opacity: 1,
                }}
              />
            )}
            
            {geoData && (
              <CircleMarker
                center={geoData.coordinates}
                radius={8}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 1,
                  color: '#ffffff',
                  weight: 2,
                }}
              >
                <Tooltip permanent={false} direction="top">
                  <span className="font-medium">{getProjectName(projectId)}</span>
                </Tooltip>
              </CircleMarker>
            )}
          </div>
        )
      })}
    </MapContainer>
  )
}
