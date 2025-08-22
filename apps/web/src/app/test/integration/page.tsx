import { IntegrationTestSuite } from "@/components/testing/integration-test-suite"

/**
 * Page component that renders the integration test suite inside a responsive container.
 *
 * This Next.js page wraps the `IntegrationTestSuite` component in a centered container with vertical padding.
 *
 * @returns The JSX element for the integration test page.
 */
export default function IntegrationTestPage() {
  return (
    <div className="container mx-auto py-6">
      <IntegrationTestSuite />
    </div>
  )
}
