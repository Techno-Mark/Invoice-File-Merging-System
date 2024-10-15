import Header from "@/components/common/Header"
import Fileuplaod from "@/components/fileupload/FileUpload"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Home() {
  return (
    <>
      <main className={`min-h-screen`}>
      <ToastContainer />
        <Header />
        <Fileuplaod />
      </main>
    </>
  )
}
