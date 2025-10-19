import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import WhopAuthenticatedApp from "@/components/WhopAuthenticatedApp";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	// Check if whopSdk is available
	if (!whopSdk) {
		return (
			<div className="flex justify-center items-center h-screen px-8">
				<div className="text-center">
					<h1 className="text-xl mb-4">Pulse Trades Experience</h1>
					<p className="text-gray-600">
						Please configure your Whop environment variables to access the experience.
					</p>
				</div>
			</div>
		);
	}

	try {
		// The headers contains the user token
		const headersList = await headers();

		// The experienceId is a path param
		const { experienceId } = await params;

		// The user token is in the headers
		const { userId } = await whopSdk.verifyUserToken(headersList);

		const result = await whopSdk.access.checkIfUserHasAccessToExperience({
			userId,
			experienceId,
		});

		const user = await whopSdk.users.getUser({ userId });
		const experience = await whopSdk.experiences.getExperience({ experienceId });

		// Either: 'admin' | 'customer' | 'no_access';
		// 'admin' means the user is an admin of the whop, such as an owner or moderator
		// 'customer' means the user is a common member in this whop
		// 'no_access' means the user does not have access to the whop
		const { accessLevel } = result;

		// Check if user has access
		if (!result.hasAccess) {
			return (
				<div className="flex justify-center items-center h-screen px-8">
					<div className="text-center">
						<h1 className="text-xl mb-4">Access Denied</h1>
						<p className="text-gray-600">
							You do not have access to this experience. Please contact the community owner.
						</p>
					</div>
				</div>
			);
		}

		// Render the full Pulse Trades app with authenticated user
		return (
			<WhopAuthenticatedApp
				whopUser={{
					id: userId,
					username: user.username,
					name: user.name || user.username,
					profile_image_url: user.profilePicture?.sourceUrl || undefined,
				}}
				isAdmin={accessLevel === 'admin'}
				companyId={experience.company.id}
			/>
		);

	} catch (error) {
		console.error('Error in experience page:', error);
		return (
			<div className="flex justify-center items-center h-screen px-8">
				<div className="text-center">
					<h1 className="text-xl mb-4">Authentication Error</h1>
					<p className="text-gray-600">
						There was an error authenticating your session. Please try refreshing the page.
					</p>
				</div>
			</div>
		);
	}
}
