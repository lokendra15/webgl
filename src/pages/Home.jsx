import GLBViewer from '../components/GLBViewer'
// import CubeRenderer from '../components/CubeRenderer'
function Home() {
  return (
  <>
  {/* <CubeRenderer width={'400px'} height={'400px'} /> */}
     <GLBViewer glbPath="./3d_modal_download.glb" />
     {/* <GLBViewer glbPath="https://filebin.net/oyzogkkvuvuw1fh5/winter_girl_free_download.glb" /> */}
     
  </>
  )
}

export default Home;
