import { FC, ReactNode } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
  BoxProps,
} from "@mui/material";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faTwitter,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";
import { BlockProtocolLogoIcon, HASHLogoIcon, FontAwesomeIcon } from "./icons";
import { Link } from "./Link";
import { LinkButton } from "./LinkButton";

const FOOTER_NAVIGATION_LINKS: { href: string; name: string }[] = [
  {
    name: "Block Hub",
    href: "/hub",
  },
  {
    name: "Documentation",
    href: "/docs",
  },
  {
    name: "Specification",
    href: "/spec",
  },
  {
    name: "Publish a Block",
    href: "/docs/publishing-blocks",
  },
  {
    name: "Contact Us",
    href: "/contact",
  },
];

const FooterNavigationLinks = FOOTER_NAVIGATION_LINKS.map(({ href, name }) => (
  <Typography
    component="p"
    variant="bpSmallCopy"
    key={href}
    sx={(theme) => ({
      color: theme.palette.gray[40],
      "&:first-of-type": {
        marginTop: {
          xs: 1.5,
          sm: 0,
        },
      },
      "&:not(:first-of-type)": {
        marginTop: 1.5,
      },
      "> a": {
        borderBottomWidth: 0,
        transition: theme.transitions.create("color", { duration: 150 }),
        ":hover": {
          color: theme.palette.gray[20],
        },
        ":active": {
          color: theme.palette.common.white,
        },
        ":focus-visible": {
          outlineColor: theme.palette.gray[40],
        },
      },
    })}
  >
    <Link href={href}>{name}</Link>
  </Typography>
));

const SOCIALS: { name: string; icon: ReactNode; href: string }[] = [
  {
    name: "Twitter",
    icon: <FontAwesomeIcon icon={faTwitter} />,
    href: "https://twitter.com/blockprotocol",
  },
  {
    name: "Discord",
    icon: <FontAwesomeIcon icon={faDiscord} />,
    href: "/discord",
  },
  {
    name: "GitHub",
    icon: <FontAwesomeIcon icon={faGithub} />,
    href: "https://github.com/blockprotocol",
  },
];

const Socials = (
  <Box
    mt={3}
    mb={2.5}
    display="flex"
    flexDirection="row"
    alignItems="center"
    flexWrap="wrap"
  >
    <Box flexShrink={0}>
      {SOCIALS.map(({ href, icon }, index) => (
        <Link
          href={href}
          key={href}
          sx={{
            padding: 1.5,
            ...(index === 0 && { paddingLeft: 0 }),
            color: (theme) => theme.palette.gray[50],
            ":hover": {
              svg: {
                color: (theme) => theme.palette.gray[30],
              },
            },
            ":active": {
              svg: {
                color: (theme) => theme.palette.common.white,
              },
            },
            ":focus-visible": {
              outlineColor: (theme) => theme.palette.gray[50],
            },
            svg: {
              fontSize: 20,
              transition: (theme) =>
                theme.transitions.create("color", { duration: 150 }),
              color: "inherit",
            },
          }}
        >
          {icon}
        </Link>
      ))}
    </Box>
    <LinkButton
      href="https://github.com/blockprotocol/blockprotocol"
      variant="primary"
      color="gray"
      size="small"
      sx={{
        flexShrink: 0,
        paddingLeft: 2.2,
        marginLeft: 2.2,
      }}
      startIcon={<FontAwesomeIcon icon={faStar} />}
    >
      Star us on GitHub
    </LinkButton>
  </Box>
);

type FooterProps = {} & BoxProps;

export const Footer: FC<FooterProps> = ({ ...boxProps }) => {
  const theme = useTheme();

  const md = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box
      {...boxProps}
      sx={{
        backgroundColor: ({ palette }) => palette.gray[90],
        ...boxProps.sx,
      }}
    >
      <Container
        sx={{
          py: {
            sm: 8,
            xs: 4,
          },
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={5} lg={4}>
            <BlockProtocolLogoIcon
              sx={{
                display: "block",
                color: theme.palette.gray[20],
              }}
            />
            {md ? (
              <>
                <Typography
                  component="p"
                  variant="bpMicroCopy"
                  sx={{
                    marginTop: 2,
                    lineHeight: "1.25rem",
                    color: ({ palette }) => palette.gray[50],
                  }}
                >
                  The open-source specification and registry
                  <br />
                  for data-driven, interactive blocks
                </Typography>
                {Socials}
              </>
            ) : null}
          </Grid>
          <Grid item xs={12} md={3} lg={4}>
            {FooterNavigationLinks}
            {md ? null : Socials}
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            display="flex"
            alignItems="flex-end"
            sx={{
              justifyContent: {
                xs: "flex-start",
                md: "flex-end",
              },
            }}
          >
            <Typography
              component="p"
              sx={{
                color: ({ palette }) => palette.gray[50],
                fontWeight: 400,
                display: "flex",
                "> a": {
                  borderBottomWidth: 0,
                  transition: theme.transitions.create(
                    ["color", "borderColor"],
                    {
                      duration: 150,
                    },
                  ),
                  ":hover": {
                    color: ({ palette }) => palette.gray[30],
                  },
                  ":active": {
                    color: ({ palette }) => palette.common.white,
                  },
                  ":focus-visible": {
                    outline: ({ palette }) => `1px solid ${palette.gray[50]}`,
                  },
                },
              }}
              variant="bpSmallCopy"
            >
              Supported by{" "}
              <Link
                href="https://hash.ai"
                sx={{
                  position: "relative",
                  top: -1,
                  marginLeft: 1,
                }}
              >
                <HASHLogoIcon />
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
