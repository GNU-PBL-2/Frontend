export default function FloatingCameraButton() {
    return (
        <button className="fixed bottom-24 left-1/2 -translate-x-[-120px] w-16 h-16 rounded-full bg-green-700 
        text-white text-4xl shadow-lg flex items-center justify-center">
                <span className="text-4xl block -mt-2">📷</span>
        </button>
    );
}