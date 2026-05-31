import fs from 'fs'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

// Mock DOM for FBXLoader
global.document = {
  createElement: () => ({
    getContext: () => null
  })
}
global.window = {
  URL: {
    createObjectURL: () => 'blob:mock',
    revokeObjectURL: () => {}
  }
}
global.URL = global.window.URL

const loader = new FBXLoader()
const buffer = fs.readFileSync('./public/models/city/City Scene.fbx')
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)

try {
  const object = loader.parse(arrayBuffer, '')
  const box = new THREE.Box3().setFromObject(object)
  console.log('Bounding Box:', box)
  console.log('Size:', {
    x: box.max.x - box.min.x,
    y: box.max.y - box.min.y,
    z: box.max.z - box.min.z
  })
} catch(e) {
  console.error(e)
}
