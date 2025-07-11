
export default function Wrapper2xl({useMinHeight, children} : {useMinHeight: boolean, children: React.ReactNode}) {
    return(
        <div className={`${useMinHeight && "min-h-screen"} bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 place-items-center p-4 font-mono`}>
            <div className="max-w-2xl w-full animate-fade-in">
                <div className="glass-card h-full rounded-3xl p-8 text-center mb-6">
                    { children }
                </div>
            </div>
        </div>
    );
}