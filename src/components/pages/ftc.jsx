import Navbar from "../Header";
import Footer from "../Footer";
import FTCLanding from "../ftc-welcome";
import ChatBolt from "../ChatBolt";
function FtcPage() {
  return (
    <div className="bg-gray-400">
      <Navbar bg="bg-black" />
      <FTCLanding/>
      <ChatBolt/>
      <Footer />
    </div>
  );
}

export default FtcPage;
