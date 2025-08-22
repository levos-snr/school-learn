import { LMSIntegrationTest } from "@/components/testing/lms-integration-test"

/**
 * Page component for the "/test" route that renders the LMSIntegrationTest UI.
 *
 * Returns the LMSIntegrationTest component mounted as the page's content.
 *
 * @returns The page's React element tree (JSX) containing LMSIntegrationTest.
 */
export default function TestPage() {
  return <LMSIntegrationTest />
}
