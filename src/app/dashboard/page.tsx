export default function DashboardPage() {
    return (
        <div className="flex-1 container mx-auto py-12 px-6 flex items-center justify-center flex-col text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">
                Welcome to your Dashboard
            </h1>
            <p className="text-muted-foreground text-lg max-w-[600px] mb-8">
                Manage your membership, view usage statistics, and configure predefined settings for your image generation sessions.
            </p>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 max-w-[400px] w-full isolate">
                <p className="text-sm text-center text-white/60">
                    Analytics and Subscription details will appear here in the future.
                </p>
            </div>
        </div>
    );
}
