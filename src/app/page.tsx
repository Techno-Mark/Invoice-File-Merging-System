import Header from "@/components/common/Header";
import Fileuplaod from "@/components/fileupload/FileUpload";

export default function Home() {
  return (
    <>
      <main className={`min-h-screen`}>
        <Header />
        <Fileuplaod />
      </main>
    </>
  );
}
