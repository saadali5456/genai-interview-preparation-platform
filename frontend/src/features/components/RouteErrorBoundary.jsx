import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import "./route-error.scss";

const RouteErrorBoundary = () => {
    const error = useRouteError();
    const isRouteError = isRouteErrorResponse(error);
    const status = isRouteError ? error.status : "Error";
    const message = isRouteError
        ? error.status === 404
            ? "The page you requested could not be found."
            : typeof error.data === "string"
                ? error.data
                : error.data?.message || error.statusText || "The page could not be loaded."
        : error instanceof Error
            ? error.message
            : "An unexpected error occurred while loading this page.";

    return (
        <main className="route-error-page">
            <section className="route-error-panel" aria-labelledby="route-error-title">
                <p className="route-error-eyebrow">INTERVIEW PREP</p>
                <h1 id="route-error-title">Something went wrong</h1>
                <p className="route-error-status">{status}</p>
                <p className="route-error-message">{message}</p>
                <Link className="button primary-button" to="/">
                    Return to home
                </Link>
            </section>
        </main>
    );
};

export default RouteErrorBoundary;