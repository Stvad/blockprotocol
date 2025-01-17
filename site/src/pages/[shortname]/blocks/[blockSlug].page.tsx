import {
  Breadcrumbs,
  Container,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { ComponentType, useMemo, VoidFunctionComponent } from "react";
import { formatDistance } from "date-fns";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { BlocksSlider } from "../../../components/BlocksSlider";
import {
  blockDependencies,
  BlockDependency,
  BlockExports,
  BlockSchema,
} from "../../../components/pages/hub/HubUtils";
import {
  readBlocksFromDisk,
  readBlockDataFromDisk,
  ExpandedBlockMetadata as BlockMetadata,
} from "../../../lib/blocks";
import { FontAwesomeIcon } from "../../../components/icons";
import { BlockDataContainer } from "../../../components/pages/hub/BlockDataContainer";
import { Link } from "../../../components/Link";

const blockRequire = (name: BlockDependency) => {
  if (!(name in blockDependencies)) {
    throw new Error(`missing dependency ${name}`);
  }

  return blockDependencies[name];
};

const blockComponentFromSource = (source: string): ComponentType => {
  // this does not guarantee filtering out all non-React components
  if (!source.includes("createElement")) {
    throw new Error(
      "Block is not a React component - please implement rendering support for whatever it is and update this check. Note that we may in future change the recommended implementation for blocks to avoid this issue.",
    );
  }

  const exports_ = {};
  const module_ = { exports: exports_ };

  // eslint-disable-next-line no-new-func
  const moduleFactory = new Function("require", "module", "exports", source);
  moduleFactory(blockRequire, module_, exports_);

  const exports = module_.exports as BlockExports;

  if (exports.default) {
    return exports.default;
  }
  if (exports.App) {
    return exports.App;
  }
  if (Object.keys(exports).length === 1) {
    return exports[Object.keys(exports)[0]!]!;
  }

  throw new Error(
    "Block component must be exported as default, App, or the only named export in the source file.",
  );
};

const Bullet: VoidFunctionComponent = () => {
  return (
    <Box component="span" mx={1.5} sx={{ color: "#DDE7F0" }}>
      •
    </Box>
  );
};

type BlockPageProps = {
  blockMetadata: BlockMetadata;
  blockStringifiedSource: string;
  catalog: BlockMetadata[];
  schema: BlockSchema;
};

type BlockPageQueryParams = {
  shortname?: string[];
  blockSlug?: string[];
};

export const getStaticPaths: GetStaticPaths<BlockPageQueryParams> = () => {
  return {
    paths: readBlocksFromDisk().map((metadata) => metadata.blockPackagePath),
    fallback: "blocking",
  };
};

const parseQueryParams = (params: BlockPageQueryParams) => {
  const shortname = params.shortname
    ? typeof params.shortname === "string"
      ? params.shortname
      : params.shortname.length === 1
      ? params.shortname[0]
      : undefined
    : undefined;

  if (!shortname) {
    throw new Error("Could not parse org shortname from query");
  }

  const blockSlug = params.blockSlug
    ? typeof params.blockSlug === "string"
      ? params.blockSlug
      : params.blockSlug.length === 1
      ? params.blockSlug[0]
      : undefined
    : undefined;

  if (!blockSlug) {
    throw new Error("Could not parse block slug from query");
  }

  return { shortname, blockSlug };
};

/**
 * Helps display `github.com/org/repo` instead of a full URL with protocol, commit hash and path.
 * If a URL is not recognised as a GitHub repo, only `https://` is removed.
 */
const generateRepositoryDisplayUrl = (repository: string): string => {
  const repositoryUrlObject = new URL(repository);
  const displayUrl = `${repositoryUrlObject.hostname}${repositoryUrlObject.pathname}`;

  if (repositoryUrlObject.hostname === "github.com") {
    return displayUrl.split("/").slice(0, 3).join("/");
  }

  return displayUrl;
};

export const getStaticProps: GetStaticProps<
  BlockPageProps,
  BlockPageQueryParams
> = async ({ params }) => {
  const { shortname, blockSlug } = parseQueryParams(params || {});

  if (!shortname.startsWith("@")) {
    return { notFound: true };
  }

  const packagePath = `${shortname}/${blockSlug}`;
  const catalog = readBlocksFromDisk();

  const blockMetadata = catalog.find(
    (metadata) => metadata.packagePath === packagePath,
  );

  if (!blockMetadata) {
    // TODO: Render custom 404 page for blocks
    return { notFound: true };
  }

  const { schema, source: blockStringifiedSource } =
    readBlockDataFromDisk(blockMetadata);

  return {
    props: {
      blockMetadata,
      blockStringifiedSource,
      catalog,
      schema,
    },
    revalidate: 1800,
  };
};

const BlockPage: NextPage<BlockPageProps> = ({
  blockMetadata,
  blockStringifiedSource,
  catalog,
  schema,
}) => {
  const { query } = useRouter();
  const { shortname } = parseQueryParams(query || {});

  const BlockComponent = useMemo(
    () =>
      typeof window === "undefined"
        ? undefined
        : blockComponentFromSource(blockStringifiedSource),
    [blockStringifiedSource],
  );

  const theme = useTheme();

  const md = useMediaQuery(theme.breakpoints.up("md"));
  const isDesktopSize = md;

  const sliderItems = useMemo(() => {
    return catalog.filter(({ name }) => name !== blockMetadata.name);
  }, [catalog, blockMetadata]);

  const repositoryDisplayUrl = blockMetadata.repository
    ? generateRepositoryDisplayUrl(blockMetadata.repository)
    : "";

  return (
    <>
      <Head>
        <title>
          Block Protocol - {blockMetadata.displayName} Block by {shortname}
        </title>
      </Head>
      <Container>
        {isDesktopSize ? null : (
          <Box mb={1}>
            <Breadcrumbs
              separator={
                <FontAwesomeIcon
                  icon={faChevronRight}
                  sx={{
                    fontSize: 14,
                    color: ({ palette }) => palette.gray[40],
                  }}
                />
              }
            >
              <Link href="/">Home</Link>
              <Link href="/hub">Block Hub</Link>
              <Typography variant="bpSmallCopy" color="inherit">
                {blockMetadata.displayName}
              </Typography>
            </Breadcrumbs>
          </Box>
        )}

        <Box
          sx={{ display: "flex", pt: { xs: 4, md: 10 }, mb: { xs: 6, md: 12 } }}
        >
          {isDesktopSize ? (
            <Typography variant="bpHeading1">
              <Box
                sx={{
                  display: "inline-block",
                  mr: 3,
                  height: "2em",
                  width: "2em",
                }}
                component="img"
                src={blockMetadata.icon ?? undefined}
              />
            </Typography>
          ) : null}

          <Box>
            <Typography
              sx={{ display: { xs: "flex", md: "unset" } }}
              variant="bpHeading1"
              mt={2}
            >
              {!isDesktopSize && (
                <Box
                  sx={{
                    display: "inline-block",
                    height: "1em",
                    width: "1em",
                    mr: 2,
                  }}
                  component="img"
                  src={blockMetadata.icon ?? undefined}
                />
              )}
              {blockMetadata.displayName}
            </Typography>
            <Typography variant="bpBodyCopy">
              <Box sx={{ color: theme.palette.gray[80] }}>
                {blockMetadata.description}
              </Box>
            </Typography>
            <Typography
              variant="bpSmallCopy"
              sx={{
                color: ({ palette }) => palette.gray[70],
              }}
            >
              <span>
                By{" "}
                <Box
                  component="span"
                  sx={{
                    color: ({ palette }) => palette.purple[700],
                  }}
                >
                  <Link href={`/${shortname}`}>{shortname}</Link>
                </Box>
              </span>
              <Bullet />
              <span>V{blockMetadata.version}</span>
              {blockMetadata.lastUpdated ? (
                <>
                  {isDesktopSize && <Bullet />}
                  <Box
                    component="span"
                    sx={{ display: { xs: "block", md: "inline-block" } }}
                  >
                    {`Updated ${formatDistance(
                      new Date(blockMetadata.lastUpdated),
                      new Date(),
                      {
                        addSuffix: true,
                      },
                    )}`}
                  </Box>
                </>
              ) : null}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 10 }}>
          <BlockDataContainer
            metadata={blockMetadata}
            schema={schema}
            BlockComponent={BlockComponent}
          />
        </Box>

        {blockMetadata.repository && (
          <Box
            mb={10}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "60% 40%" },
            }}
          >
            <Box />
            <Box sx={{ overflow: "hidden" }} pl={{ xs: 0, md: 2 }}>
              <Typography
                variant="bpLargeText"
                sx={{
                  fontWeight: "bold",
                  color: theme.palette.gray[80],
                  marginBottom: 2,
                }}
              >
                Repository
              </Typography>
              <Box sx={{ display: "flex" }}>
                <Box
                  component="img"
                  alt="GitHub Link"
                  sx={{ marginRight: 1.5 }}
                  src="/assets/link.svg"
                />{" "}
                <Typography
                  variant="bpSmallCopy"
                  sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  <Link href={blockMetadata.repository}>
                    {repositoryDisplayUrl}
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* <div
        style={{ display: "grid", gridTemplateColumns: "60% 40%" }}
        className=" mb-10"
      >
        <div>
          <b>About</b>
          <p>
            Store information in rows and columns in a classic table layout.
            Longer description talking about parameters and how to use like a
            readme goes in here. Tables have filters, search, ability to add and
            remove columns and rows, multiple views. Tables have filters,
            search, ability to add and remove columns and rows, multiple views.
            Tables have filters, search, ability to add and remove columns and
            rows, multiple views. Tables have filters, search, ability to add
            and remove columns and rows, multiple views.
          </p>
        </div>
        
      </div> */}

        <Typography textAlign="center" variant="bpHeading2" mb={3}>
          Explore more blocks
        </Typography>
      </Container>
      <BlocksSlider catalog={sliderItems} />
    </>
  );
};

export default BlockPage;
