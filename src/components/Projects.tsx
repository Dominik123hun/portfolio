/**
 * <Projects /> — lays out one <ProjectPanel /> per entry in data/projects.ts.
 * Positions and the camera path both derive from the same data, so adding or
 * removing a project "just works".
 */

import { ProjectPanel } from './ProjectPanel'
import { projects } from '../data/projects'
import type { Tier } from '../lib/tier'

interface ProjectsProps {
  tier: Tier
}

export function Projects({ tier }: ProjectsProps) {
  return (
    <group>
      {projects.map((project, i) => (
        <ProjectPanel key={project.id} project={project} index={i} tier={tier} />
      ))}
    </group>
  )
}
