import { useState, useEffect, useRef } from "react";
import { getConversations, getHistory, replyToSMS, simulateIncoming } from "../services/sms";
import { FaPaperPlane, FaUserCircle, FaSearch, FaCommentDots, FaClock, FaCheckDouble } from "react-icons/fa";
import Swal from "sweetalert2";

const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
};
const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
};

export default function SMSCenter() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConvo) {
      fetchHistory(selectedConvo.phoneNumber);
    }
  }, [selectedConvo]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConvo) {
        setSelectedConvo(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async (number) => {
    setLoading(true);
    try {
      const data = await getHistory(number);
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConvo) return;

    try {
      const resp = await replyToSMS({
        phoneNumber: selectedConvo.phoneNumber,
        message: replyText
      });
      setMessages([...messages, resp]);
      setReplyText("");
      fetchConversations();
    } catch (err) {
      Swal.fire("Error", "Failed to send SMS", "error");
    }
  };

  const handleSimulate = async () => {
      const { value: formValues } = await Swal.fire({
          title: 'Simulate Incoming SMS',
          html:
            '<input id="swal-input1" class="swal2-input" placeholder="Phone Number">' +
            '<input id="swal-input2" class="swal2-input" placeholder="Message">',
          focusConfirm: false,
          preConfirm: () => {
            return [
              document.getElementById('swal-input1').value,
              document.getElementById('swal-input2').value
            ]
          }
      });

      if (formValues) {
          const [phone, msg] = formValues;
          if(!phone || !msg) return;
          try {
              await simulateIncoming({ phoneNumber: phone, message: msg });
              fetchConversations();
              if(selectedConvo && selectedConvo.phoneNumber === phone) {
                  fetchHistory(phone);
              }
              Swal.fire("Success", "SMS Received!", "success");
          } catch (e) {
              Swal.fire("Error", "Simulation failed", "error");
          }
      }
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="flex bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100" style={{ height: "calc(100vh - 120px)" }}>
      
      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-blue-600">
            <FaCommentDots /> SMS Center
          </h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
            />
            <FaSearch className="absolute left-3 top-3 text-slate-400 text-sm" />
          </div>
          <button 
            onClick={handleSimulate}
            className="mt-3 w-full py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
          >
            + SIMULATE INCOMING
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((convo) => (
            <div 
              key={convo.phoneNumber}
              onClick={() => setSelectedConvo(convo)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-all border-b border-slate-100/50 ${selectedConvo?.phoneNumber === convo.phoneNumber ? 'bg-white shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] scale-[0.98] z-10' : 'hover:bg-white/50'}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 uppercase font-black text-lg">
                {convo.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-sm text-slate-800 truncate">{convo.name}</span>
                  <span className="text-[10px] text-slate-400">{formatTime(convo.lastDate)}</span>
                </div>
                <p className="text-xs text-slate-500 truncate font-semibold">{convo.lastMessage}</p>
              </div>
              {convo.unreadCount > 0 && (
                <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black animate-pulse">
                  {convo.unreadCount}
                </div>
              )}
            </div>
          ))}
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                <FaCommentDots className="text-4xl opacity-20" />
                <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConvo ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <FaUserCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 leading-none">{selectedConvo.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">{selectedConvo.phoneNumber}</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-tighter uppercase border border-emerald-100">Active</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ backgroundColor: "#f8fafc" }}>
              <div className="flex flex-col gap-4">
                {messages.map((msg, idx) => (
                  <div 
                    key={msg._id || idx}
                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] group`}>
                       <div className={`p-4 rounded-3xl shadow-sm text-sm relative transition-all hover:shadow-md ${msg.direction === 'outbound' 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none font-bold'}`}
                      >
                        {msg.message}
                        <div className={`flex items-center gap-1 mt-2 text-[9px] font-black opacity-60 ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                          <FaClock /> {formatDate(msg.createdAt)}
                          {msg.direction === 'outbound' && <FaCheckDouble className="text-blue-300 ml-1" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleReply} className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
              <input 
                type="text" 
                placeholder="Type your reply here..." 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-black"
              />
              <button 
                type="submit"
                disabled={!replyText.trim()}
                className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-slate-50/30">
            <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <FaCommentDots className="text-6xl text-blue-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Message Center</h3>
            <p className="text-slate-400 max-w-sm font-bold">Communicate with customers directly via SMS here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
