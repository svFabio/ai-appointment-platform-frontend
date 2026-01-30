// Sonido de notificación simple usando Audio API
export const playNotificationSound = () => {
    try {
        // Usar un sonido de sistema nativo
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltrzxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSF1xe/glEQMEmS47d+iTw4MUKjm8bplGwU5kdny0IMxBh1rvu3mnU4ODlKk5O+0XxoHPJXYw');
        audio.volume = 0.5;
        audio.play().catch(err => console.log('Could not play sound:', err));
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
};
