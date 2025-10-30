import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { CloseIcon, PaperAirplaneIcon } from './icons';
import { ViewState, Chapter } from '../App';

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewState) => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  quickReplies?: string[];
}

const systemInstruction = `You are a friendly and helpful AI assistant for an educational app named 'Chalo ભણીએ !'. Your purpose is to help students navigate and use the app.

You must only answer questions based on the information provided below.

**App Content and Features:**

1.  **Supported Standards (Grades):**
    *   Standard 9
    *   Standard 10

2.  **Supported Subject:**
    *   Math

3.  **Available Resources for Math (for each chapter):**
    *   **Video Solutions:** Detailed video tutorials for each exercise (સ્વાધ્યાય).
    *   **Written PDF Solutions:** Step-by-step written solutions for each exercise (સ્વાધ્યાય).
    *   **Textbooks:** Official textbook PDF is available.

4.  **Other App Features:**
    *   **Old Papers:** A section for previous years' question papers (currently marked as 'Coming Soon').
    *   **Mock Tests:** A section for practice tests (currently marked as 'Coming Soon').
    *   **Search Example (દાખલો શોધો):** A feature that allows students to find a specific example by selecting their grade, chapter, and exercise number.

**List of Math Chapters:**

*   **Standard 9 Chapters:**
    1. સંખ્યા પદ્ધતિ
    2. બહુપદીઓ
    3. યામ ભૂમિતિ
    4. દ્વિચલ સુરેખ સમીકરણો
    5. યુક્લિડની ભૂમિતિનો પરિચય
    6. રેખાઓ અને ખૂણાઓ
    7. ત્રિકોણ
    8. ચતુષ્કોણ
    9. વર્તુળ
    10. હેરોનનું સૂત્ર
    11. પૃષ્ઠફળ અને ઘનફળ
    12. આંકડાશાસ્ત્ર

*   **Standard 10 Chapters:**
    1. વાસ્તવિક સંખ્યાઓ
    2. બહુપદીઓ
    3. દ્વિચલ સુરેખ સમીકરણયુગ્મ
    4. દ્વિઘાત સમીકરણ
    5. સમાંતર શ્રેણી
    6. ત્રિકોણ
    7. યામ ભૂમિતિ
    8. ત્રિકોણમિતિનો પરિચય
    9. ત્રિકોણમિતિના ઉપયોગો
    10. વર્તુળ
    11. વર્તુળ સંબંધિત ક્ષેત્રફળ
    12. પૃષ્ઠફળ અને ઘનફળ
    13. આંકડાશાસ્ત્ર
    14. સંભાવના

**Your Behavior:**

*   **Stick to the Information:** Do not invent features, subjects, or standards that are not on this list.
*   **Handle Out-of-Scope Questions:** If the user asks about another subject (like Science), another grade (like 11), or a feature not mentioned, you must politely state that it's not currently available and the team is working on expanding the content. For example: "હાલમાં, અમારી પાસે ફક્ત ધોરણ 9 અને 10 માટે ગણિત વિષય જ ઉપલબ્ધ છે. અમે ટૂંક સમયમાં વધુ વિષયો અને ધોરણો ઉમેરવા માટે કામ કરી રહ્યા છીએ!"
*   **Be Concise and Helpful:** Keep your answers short and to the point.
*   **Language:** You must communicate primarily in Gujarati.
*   **Do not provide URLs or links.** Guide the user on how to navigate within the app. For example: "તમે ધોરણ 9 > ગણિત > સ્વાધ્યાય > પ્રકરણ 2 પર નેવિગેટ કરીને ધોરણ 9, પ્રકરણ 2 માટેના વિડિઓ ઉકેલો શોધી શકો છો."
*   **Quick Replies:** To guide the user, provide clickable suggestions. When you ask a question or present options, provide them at the end of your message in the format QUICK_REPLIES:[Option 1],[Option 2],[Option 3]. For example: "તમને કયા ધોરણમાં રસ છે? QUICK_REPLIES:[ધોરણ 9],[ધોરણ 10]". Only use this to provide choices to the user.
*   **Navigation:** When you determine that the user wants to see a specific solution, do not navigate directly. First, ask them if they want to go to the solution page.
    *   **Step 1: Ask for confirmation.** Your message should be like: "મારી પાસે [Standard], [Chapter], [Exercise] માટે ઉકેલ છે. શું તમે ત્યાં જવા માંગો છો? QUICK_REPLIES:[હા],[ના]".
    *   **Step 2: Wait for the user's response.**
    *   **Step 3: Navigate ONLY if the user says "Yes" ("હા").** Your response should be brief, like "તમને ત્યાં લઈ જાઉં છું..." and then issue a special command in this exact format: \`NAVIGATE:{"page":"chapter","grade":<GRADE_NUMBER>,"chapterNumber":<CHAPTER_NUMBER>,"chapterName":"<CHAPTER_NAME_GUJARATI>","exercise":"<EXERCISE_NAME_GUJARATI>"}\`. The \`chapterName\` and \`exercise\` must be in Gujarati to match the app's internal data. For example: \`NAVIGATE:{"page":"chapter","grade":9,"chapterNumber":1,"chapterName":"સંખ્યા પદ્ધતિ","exercise":"સ્વાધ્યાય 1.1"}\`. If the user says "No" ("ના"), continue the conversation.`;


const TypingIndicator: React.FC = () => (
  <div className="flex justify-start">
    <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl rounded-bl-none bg-slate-200 dark:bg-slate-700">
      <div className="flex items-center justify-center space-x-1">
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce-dot bounce-1"></div>
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce-dot bounce-2"></div>
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce-dot bounce-3"></div>
      </div>
    </div>
  </div>
);

const ChatBox: React.FC<ChatBoxProps> = ({ isOpen, onClose, onNavigate }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const initialMessage: Message = {
      id: 0,
      text: "નમસ્કાર! હું 'Chalo ભણીએ !' એપ માટે AI સહાયક છું. તમને શું શોધવામાં મદદ કરી શકું?",
      sender: 'bot',
      quickReplies: ["ધોરણ 9", "ધોરણ 10", "દાખલો શોધો"]
  };
  
  const [conversation, setConversation] = useState<Message[]>([initialMessage]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);
  const messageIdCounter = useRef(1);


  useEffect(() => {
    if (isOpen && !chatRef.current) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: systemInstruction,
                },
            });
        } catch (error) {
            console.error("Failed to initialize Gemini Chat:", error);
            setConversation(prev => [...prev, {
                id: messageIdCounter.current++,
                text: "માફ કરશો, ચેટ સેવા હાલમાં અનુપલબ્ધ છે.",
                sender: 'bot'
            }]);
        }
    } else if (!isOpen) {
        // Reset chat session when closed
        chatRef.current = null;
    }
  }, [isOpen]);

  const performClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      // Reset conversation for next time
      setConversation([initialMessage]);
      messageIdCounter.current = 1;
    }, 300); // Match animation duration
  };

  const handleClose = () => {
    performClose();
  };
  
  const parseResponse = (responseText: string): { text: string; quickReplies?: string[], navigation?: any } => {
    const replyRegex = /QUICK_REPLIES:\[(.*?)\]$/;
    const navigateRegex = /NAVIGATE:({.*?})$/;

    let text = responseText;
    let quickReplies: string[] | undefined;
    let navigation: any | undefined;

    const navMatch = text.match(navigateRegex);
    if (navMatch && navMatch[1]) {
        text = text.replace(navigateRegex, '').trim();
        try {
            navigation = JSON.parse(navMatch[1]);
        } catch (e) {
            console.error("Failed to parse navigation JSON:", e);
        }
    }

    const replyMatch = text.match(replyRegex);
    if (replyMatch && replyMatch[1]) {
        text = text.replace(replyRegex, '').trim();
        quickReplies = replyMatch[1].split(',').map(r => r.trim().replace(/^\[|\]$/g, '').trim());
    }

    return { text, quickReplies, navigation };
  };

  const sendMessage = async (textToSend: string) => {
    if (textToSend.trim() === '' || !chatRef.current) return;
    
    setConversation(prev => prev.map((msg, index) => 
        index === prev.length - 1 ? { ...msg, quickReplies: undefined } : msg
    ));

    const userMessage: Message = { id: messageIdCounter.current++, text: textToSend, sender: 'user' };
    setConversation(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
        const response = await chatRef.current.sendMessage({ message: textToSend });
        const { text, quickReplies, navigation } = parseResponse(response.text);
        
        const botReply: Message = { id: messageIdCounter.current++, text: text || "તમને ત્યાં લઈ જાઉં છું...", sender: 'bot', quickReplies };
        setConversation(prev => [...prev, botReply]);

        if (navigation && onNavigate) {
            const chapter: Chapter = { number: navigation.chapterNumber, name: navigation.chapterName };
            const viewState: ViewState = {
                page: 'chapter',
                grade: navigation.grade,
                chapter: chapter,
                expandedExercise: navigation.exercise
            };
            setTimeout(() => {
                onNavigate(viewState);
                handleClose();
            }, 100); 
        }

    } catch (error) {
        console.error("Gemini API error:", error);
        const errorReply: Message = { id: messageIdCounter.current++, text: "માફ કરશો, મને અત્યારે કનેક્ટ કરવામાં મુશ્કેલી પડી રહી છે. કૃપા કરીને પછીથી ફરી પ્રયાસ કરો.", sender: 'bot' };
        setConversation(prev => [...prev, errorReply]);
    } finally {
        setIsTyping(false);
    }
  };

  const handleSend = () => sendMessage(message);

  const handleQuickReplyClick = (replyText: string) => {
      sendMessage(replyText);
  };


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation, isTyping]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-40 flex items-end justify-center animate-fade-in"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-lg h-[70vh] flex flex-col bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl ${isClosing ? 'animate-slide-out-to-bottom' : 'animate-slide-in-from-bottom'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Chalo ભણીએ !</h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="ચેટ બંધ કરો"
          >
            <CloseIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Conversation Body */}
        <div ref={chatContainerRef} className="flex-1 p-4 space-y-2 overflow-y-auto">
          {conversation.map((msg, index) => (
            <div key={msg.id}>
                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
                {msg.quickReplies && msg.quickReplies.length > 0 && index === conversation.length - 1 && (
                     <div className="flex flex-wrap gap-2 mt-3 justify-start">
                        {msg.quickReplies.map((reply, i) => (
                            <button 
                                key={i}
                                onClick={() => handleQuickReplyClick(reply)}
                                className="px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-100 dark:text-indigo-200 dark:bg-indigo-900/50 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800/60 transition-colors"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                )}
            </div>
          ))}
          {isTyping && <TypingIndicator />}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="તમારો સંદેશ લખો..."
              rows={1}
              className="flex-1 w-full p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
            <button
              onClick={handleSend}
              disabled={message.trim() === '' || isTyping}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-110"
              aria-label="સંદેશ મોકલો"
            >
              <PaperAirplaneIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;